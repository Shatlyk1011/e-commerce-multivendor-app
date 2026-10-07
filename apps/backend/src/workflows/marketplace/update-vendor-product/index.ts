import type { ProductStatus } from "@medusajs/framework/utils";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  batchInventoryItemLevelsWorkflow,
  batchProductVariantsWorkflow,
  createAndLinkProductOptionsToProductWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

import { validateProductOptionsStep } from "../../product-option-templates/steps/validate-product-options";

export type UpdateVendorProductInput = {
  vendor_admin_id: string;
  product_id: string;
  product: {
    title: string;
    handle: string;
    thumbnail: string | null;
    images: Array<{ id?: string; url: string }>;
    categories: Array<{ id: string }>;
    metadata: { keywords: string[] };
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    origin_country: string | null;
    material: string | null;
    options: Array<{ id?: string; title: string; values: string[] }>;
    variants: Array<{
      id?: string;
      title: string;
      sku: string | null;
      barcode: string | null;
      options: Record<string, string>;
      price: number;
      price_id?: string;
      inventory: number;
    }>;
  };
};

type CurrentOption = {
  id: string;
  title: string;
  values?: Array<{ id: string; value: string }> | null;
};

type CurrentVariant = {
  id: string;
  sku?: string | null;
};

type CurrentProduct = {
  id: string;
  status: ProductStatus;
  options?: CurrentOption[] | null;
  variants?: CurrentVariant[] | null;
};

type VendorAdminGraph = {
  vendor?: {
    stock_location_id?: string | null;
    products?: CurrentProduct[] | null;
  } | null;
};

type ProductInventoryGraph = {
  variants?: Array<{
    id: string;
    inventory_items?: Array<{ inventory_item_id: string }> | null;
  }> | null;
};

type InventoryItemGraph = {
  id: string;
  location_levels?: Array<{
    id: string;
    location_id: string;
  }> | null;
};

const updateVendorProductStep = createStep(
  "update-vendor-product",
  async (input: UpdateVendorProductInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const {
      data: [vendorAdminData],
    } = await query.graph({
      entity: "vendor_admin",
      fields: [
        "vendor.stock_location_id",
        "vendor.products.id",
        "vendor.products.status",
        "vendor.products.options.id",
        "vendor.products.options.title",
        "vendor.products.options.values.id",
        "vendor.products.options.values.value",
        "vendor.products.variants.id",
        "vendor.products.variants.sku",
      ],
      filters: { id: input.vendor_admin_id },
    });

    const vendorAdmin = vendorAdminData as VendorAdminGraph | undefined;
    const currentProduct = vendorAdmin?.vendor?.products?.find(
      (product) => product.id === input.product_id,
    );

    if (!currentProduct) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Product not found or does not belong to this vendor.",
      );
    }

    const currentOptions = currentProduct.options ?? [];
    const desiredOptions = input.product.options;
    const currentOptionsById = new Map(currentOptions.map((option) => [option.id, option]));
    const matchedCurrentOptionIds = new Set<string>();
    const addOptions: Array<{ title: string; values: string[] }> = [];
    const prepareOptionValues: Array<{
      product_option_id: string;
      add: Array<{ value: string }>;
    }> = [];

    for (const desiredOption of desiredOptions) {
      const currentOption = desiredOption.id
        ? currentOptionsById.get(desiredOption.id)
        : currentOptions.find((option) => option.title === desiredOption.title);

      if (!currentOption || currentOption.title !== desiredOption.title) {
        addOptions.push({
          title: desiredOption.title,
          values: desiredOption.values,
        });
        continue;
      }

      matchedCurrentOptionIds.add(currentOption.id);
      const currentValues = new Set(
        (currentOption.values ?? []).map((value) => value.value),
      );
      const valuesToAdd = desiredOption.values
        .filter((value) => !currentValues.has(value))
        .map((value) => ({ value }));

      if (valuesToAdd.length > 0) {
        prepareOptionValues.push({
          product_option_id: currentOption.id,
          add: valuesToAdd,
        });
      }
    }

    if (addOptions.length > 0 || prepareOptionValues.length > 0) {
      await createAndLinkProductOptionsToProductWorkflow(container).run({
        input: {
          product_id: input.product_id,
          add: addOptions,
          update: prepareOptionValues,
        },
      });
    }

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: input.product_id },
        update: {
          title: input.product.title,
          handle: input.product.handle,
          thumbnail: input.product.thumbnail,
          images: input.product.images,
          category_ids: input.product.categories.map((category) => category.id),
          metadata: input.product.metadata,
          weight: input.product.weight,
          length: input.product.length,
          width: input.product.width,
          height: input.product.height,
          origin_country: input.product.origin_country,
          material: input.product.material,
          status: currentProduct.status,
        },
      },
    });

    const currentVariantIds = new Set(
      (currentProduct.variants ?? []).map((variant) => variant.id),
    );
    const desiredExistingVariantIds = new Set<string>();
    const variantsToCreate = input.product.variants
      .filter((variant) => !variant.id)
      .map((variant) => ({
        product_id: input.product_id,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        manage_inventory: true,
        options: variant.options,
        metadata: { inventory_quantity: variant.inventory },
        prices: [{ currency_code: "tmt", amount: variant.price }],
      }));
    const variantsToUpdate = input.product.variants
      .filter((variant): variant is typeof variant & { id: string } => Boolean(variant.id))
      .map((variant) => {
        if (!currentVariantIds.has(variant.id)) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            `Variant ${variant.id} does not belong to this product.`,
          );
        }
        desiredExistingVariantIds.add(variant.id);
        return {
          id: variant.id,
          product_id: input.product_id,
          title: variant.title,
          sku: variant.sku,
          barcode: variant.barcode,
          manage_inventory: true,
          options: variant.options,
          metadata: { inventory_quantity: variant.inventory },
          prices: [
            {
              id: variant.price_id,
              currency_code: "tmt",
              amount: variant.price,
            },
          ],
        };
      });
    const variantsToDelete = [...currentVariantIds].filter(
      (id) => !desiredExistingVariantIds.has(id),
    );

    const { result: variantBatchResult } = await batchProductVariantsWorkflow(
      container,
    ).run({
      input: {
        create: variantsToCreate,
        update: variantsToUpdate,
        delete: variantsToDelete,
      },
    });

    const removeOptions = currentOptions
      .filter((option) => !matchedCurrentOptionIds.has(option.id))
      .map((option) => option.id);
    const cleanupOptionValues = currentOptions
      .filter((option) => matchedCurrentOptionIds.has(option.id))
      .map((option) => {
        const desiredOption = desiredOptions.find(
          (candidate) =>
            candidate.id === option.id || candidate.title === option.title,
        );
        const desiredValues = new Set(desiredOption?.values ?? []);
        return {
          product_option_id: option.id,
          remove: (option.values ?? [])
            .filter((value) => !desiredValues.has(value.value))
            .map((value) => value.id),
        };
      })
      .filter((update) => update.remove.length > 0);

    if (removeOptions.length > 0 || cleanupOptionValues.length > 0) {
      await createAndLinkProductOptionsToProductWorkflow(container).run({
        input: {
          product_id: input.product_id,
          remove: removeOptions,
          update: cleanupOptionValues,
        },
      });
    }

    const inventoryByVariantId = new Map<string, number>();
    for (const variant of input.product.variants) {
      if (variant.id) inventoryByVariantId.set(variant.id, variant.inventory);
    }
    variantsToCreate.forEach((variant, index) => {
      const createdVariant = variantBatchResult.created[index];
      const desiredVariant = input.product.variants.filter((item) => !item.id)[
        index
      ];
      if (createdVariant && desiredVariant) {
        inventoryByVariantId.set(createdVariant.id, desiredVariant.inventory);
      }
    });

    const { data: productsWithInventoryData } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "variants.id",
        "variants.inventory_items.inventory_item_id",
      ],
      filters: { id: input.product_id },
    });
    const productWithInventory = productsWithInventoryData[0] as
      | ProductInventoryGraph
      | undefined;
    const inventoryItemByVariantId = new Map<string, string>();
    for (const variant of productWithInventory?.variants ?? []) {
      const inventoryItemId = variant.inventory_items?.[0]?.inventory_item_id;
      if (inventoryItemId) {
        inventoryItemByVariantId.set(variant.id, inventoryItemId);
      }
    }

    const inventoryItemIds = [...inventoryItemByVariantId.values()];
    const { data: inventoryItemsData } = inventoryItemIds.length
      ? await query.graph({
          entity: "inventory_item",
          fields: ["id", "location_levels.id", "location_levels.location_id"],
          filters: { id: inventoryItemIds },
        })
      : { data: [] };
    const inventoryItems = inventoryItemsData as InventoryItemGraph[];
    const inventoryItemsById = new Map(
      inventoryItems.map((inventoryItem) => [inventoryItem.id, inventoryItem]),
    );
    const locationId = vendorAdmin?.vendor?.stock_location_id;

    if (locationId) {
      const createLevels: Array<{
        inventory_item_id: string;
        location_id: string;
        stocked_quantity: number;
      }> = [];
      const updateLevels: Array<{
        id: string;
        inventory_item_id: string;
        location_id: string;
        stocked_quantity: number;
      }> = [];

      for (const [variantId, inventory] of inventoryByVariantId) {
        const inventoryItemId = inventoryItemByVariantId.get(variantId);
        if (!inventoryItemId) continue;
        const existingLevel = inventoryItemsById
          .get(inventoryItemId)
          ?.location_levels?.find((level) => level.location_id === locationId);

        if (existingLevel) {
          updateLevels.push({
            id: existingLevel.id,
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            stocked_quantity: inventory,
          });
        } else {
          createLevels.push({
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            stocked_quantity: inventory,
          });
        }
      }

      if (createLevels.length > 0 || updateLevels.length > 0) {
        await batchInventoryItemLevelsWorkflow(container).run({
          input: {
            create: createLevels,
            update: updateLevels,
            delete: [],
          },
        });
      }
    }

    return new StepResponse({ product_id: input.product_id });
  },
);

const updateVendorProductWorkflow = createWorkflow(
  "update-vendor-product",
  function (input: UpdateVendorProductInput) {
    validateProductOptionsStep(input.product.options);
    const result = updateVendorProductStep(input);
    return new WorkflowResponse(result);
  },
);

export default updateVendorProductWorkflow;
