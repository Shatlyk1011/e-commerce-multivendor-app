import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  MedusaError,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { MARKETPLACE_MODULE } from "../modules/marketplace";
import MarketplaceModuleService from "../modules/marketplace/service";

type InventoryLevelInput = {
  inventory_item_id: string;
  location_id: string;
  stocked_quantity: number;
};

type DeliveryOptionSeed = {
  name: string;
  code: "courier" | "pickup";
  label: string;
  description: string;
};

export default async function backfillVendorStockLocationSalesChannels({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  );

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id"],
  });
  const defaultSalesChannelId = stores[0]?.default_sales_channel_id;

  if (!defaultSalesChannelId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "The default sales channel could not be found.",
    );
  }

  const { data: vendors } = await query.graph({
    entity: "vendor",
    fields: [
      "id",
      "name",
      "city",
      "stock_location_id",
      "products.id",
      "products.shipping_profile.id",
      "products.variants.metadata",
      "products.variants.inventory_items.inventory_item_id",
    ],
  });
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: [
      "id",
      "stock_locations.id",
      "stock_locations.fulfillment_sets.id",
      "stock_locations.fulfillment_providers.id",
    ],
    filters: { id: defaultSalesChannelId },
  });
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  let shippingProfileId = shippingProfiles[0]?.id;
  if (!shippingProfileId) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Marketplace delivery", type: "default" }] },
    });
    shippingProfileId = result[0].id;
  }

  const productsWithoutShippingProfile = vendors.flatMap(
    (vendor) =>
      vendor.products
        ?.filter((product) => product && !product.shipping_profile?.id)
        .map((product) => ({
          id: product!.id,
          shipping_profile_id: shippingProfileId,
        })) ?? [],
  );
  if (productsWithoutShippingProfile.length > 0) {
    await updateProductsWorkflow(container).run({
      input: { products: productsWithoutShippingProfile },
    });
  }

  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "service_zones.id"],
  });
  let deliveryFulfillmentSetId = fulfillmentSets[0]?.id;
  let deliveryServiceZoneId = fulfillmentSets[0]?.service_zones?.[0]?.id;

  if (!deliveryFulfillmentSetId || !deliveryServiceZoneId) {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets(
      {
        name: "Marketplace delivery",
        type: "shipping",
        service_zones: [
          {
            name: "Turkmenistan delivery",
            geo_zones: [{ country_code: "tm", type: "country" }],
          },
        ],
      },
    );
    deliveryFulfillmentSetId = fulfillmentSet.id;
    deliveryServiceZoneId = fulfillmentSet.service_zones[0].id;
  }

  // Shipping-option creation validates that its provider is available at at
  // least one stock location in the fulfillment set. Older databases can have
  // neither a seeded main location nor vendor locations yet, so bootstrap one.
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.id", "fulfillment_providers.id"],
  });
  const existingBootstrapLocation = stockLocations.find((location) =>
    Boolean(location?.id),
  );
  let bootstrapLocationId = existingBootstrapLocation?.id;
  let bootstrapHasProvider = Boolean(
    existingBootstrapLocation?.fulfillment_providers?.some(
      (provider) => provider?.id === "manual_manual",
    ),
  );
  let bootstrapHasFulfillmentSet = Boolean(
    existingBootstrapLocation?.fulfillment_sets?.some(
      (set) => set?.id === deliveryFulfillmentSetId,
    ),
  );
  if (!bootstrapLocationId) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Marketplace Delivery",
            address: { city: "Ashgabat", country_code: "tm", address_1: "" },
          },
        ],
      },
    });
    bootstrapLocationId = result[0].id;
    bootstrapHasProvider = false;
    bootstrapHasFulfillmentSet = false;
  }
  if (!bootstrapHasProvider) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: bootstrapLocationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
    bootstrapHasProvider = true;
  }
  if (!bootstrapHasFulfillmentSet) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: bootstrapLocationId },
      [Modules.FULFILLMENT]: { fulfillment_set_id: deliveryFulfillmentSetId },
    });
    bootstrapHasFulfillmentSet = true;
  }

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "type.code", "service_zone.fulfillment_set_id"],
  });
  const deliveryOptionCodes = new Set(
    shippingOptions
      .filter(
        (option) =>
          option.service_zone?.fulfillment_set_id === deliveryFulfillmentSetId,
      )
      .map((option) => option.type?.code)
      .filter((code): code is string => Boolean(code)),
  );
  const missingOptions: DeliveryOptionSeed[] = [];
  if (!deliveryOptionCodes.has("courier")) {
    missingOptions.push({
      name: "Courier delivery",
      code: "courier",
      label: "Courier",
      description: "Courier delivery to the customer's address.",
    });
  }
  if (!deliveryOptionCodes.has("pickup")) {
    missingOptions.push({
      name: "Pickup point",
      code: "pickup",
      label: "Pickup",
      description: "Pickup at a selected collection point.",
    });
  }

  if (missingOptions.length > 0) {
    await createShippingOptionsWorkflow(container).run({
      input: missingOptions.map((option) => ({
        name: option.name,
        price_type: "flat" as const,
        provider_id: "manual_manual",
        service_zone_id: deliveryServiceZoneId,
        shipping_profile_id: shippingProfileId,
        type: {
          label: option.label,
          description: option.description,
          code: option.code,
        },
        prices: [
          { currency_code: "tmt", amount: option.code === "courier" ? 10 : 0 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      })),
    });
  }

  const linkedStockLocationIds = new Set(
    salesChannels[0]?.stock_locations
      ?.map((stockLocation) => stockLocation?.id)
      .filter((stockLocationId): stockLocationId is string =>
        Boolean(stockLocationId),
      ) ?? [],
  );
  const vendorLocationIds = new Map<string, string>();
  const providerLocationIds = new Set(
    stockLocations
      ?.filter((location) =>
        location?.fulfillment_providers?.some(
          (provider) => provider?.id === "manual_manual",
        ),
      )
      .map((location) => location?.id)
      .filter((id): id is string => Boolean(id)) ?? [],
  );
  if (bootstrapHasProvider && bootstrapLocationId) {
    providerLocationIds.add(bootstrapLocationId);
  }
  let createdStockLocations = 0;
  let linkedStockLocations = 0;
  let linkedFulfillmentProviders = 0;

  // This location owns the delivery fulfillment set and makes its shipping
  // options eligible for every cart in the marketplace sales channel.
  if (bootstrapLocationId && !linkedStockLocationIds.has(bootstrapLocationId)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: bootstrapLocationId, add: [defaultSalesChannelId] },
    });
    linkedStockLocationIds.add(bootstrapLocationId);
    linkedStockLocations += 1;
  }

  for (const vendor of vendors) {
    let stockLocationId = vendor.stock_location_id;

    if (!stockLocationId) {
      const { result: stockLocations } = await createStockLocationsWorkflow(
        container,
      ).run({
        input: {
          locations: [
            {
              name: `${vendor.name} - Склад`,
              address: {
                address_1: vendor.city ?? "",
                city: vendor.city ?? "",
                country_code: "tm",
              },
            },
          ],
        },
      });

      stockLocationId = stockLocations[0].id;
      await marketplaceService.updateVendors({
        id: vendor.id,
        stock_location_id: stockLocationId,
      });
      createdStockLocations += 1;
    }

    vendorLocationIds.set(vendor.id, stockLocationId);

    if (!linkedStockLocationIds.has(stockLocationId)) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
          id: stockLocationId,
          add: [defaultSalesChannelId],
        },
      });
      linkedStockLocationIds.add(stockLocationId);
      linkedStockLocations += 1;
    }

    if (!providerLocationIds.has(stockLocationId)) {
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      });
      providerLocationIds.add(stockLocationId);
      linkedFulfillmentProviders += 1;
    }
  }

  const inventoryItemIds = vendors.flatMap(
    (vendor) =>
      vendor.products?.flatMap(
        (product) =>
          product?.variants?.flatMap(
            (variant) =>
              variant?.inventory_items
                ?.map((inventoryItem) => inventoryItem?.inventory_item_id)
                .filter((inventoryItemId): inventoryItemId is string =>
                  Boolean(inventoryItemId),
                ) ?? [],
          ) ?? [],
      ) ?? [],
  );
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "location_levels.location_id"],
    filters: { id: inventoryItemIds },
  });
  const inventoryLocationIds = new Map(
    inventoryItems.map((inventoryItem) => [
      inventoryItem.id,
      new Set(
        inventoryItem.location_levels
          ?.map((locationLevel) => locationLevel?.location_id)
          .filter((locationId): locationId is string => Boolean(locationId)) ??
          [],
      ),
    ]),
  );
  const inventoryLevels: InventoryLevelInput[] = [];

  for (const vendor of vendors) {
    const stockLocationId = vendorLocationIds.get(vendor.id);
    if (!stockLocationId) {
      continue;
    }

    for (const product of vendor.products ?? []) {
      for (const variant of product?.variants ?? []) {
        const inventoryItemId =
          variant?.inventory_items?.[0]?.inventory_item_id;
        const quantity = Number(
          (variant?.metadata as Record<string, unknown> | null)
            ?.inventory_quantity,
        );

        if (
          !inventoryItemId ||
          !Number.isInteger(quantity) ||
          quantity < 0 ||
          inventoryLocationIds.get(inventoryItemId)?.has(stockLocationId)
        ) {
          continue;
        }

        inventoryLevels.push({
          inventory_item_id: inventoryItemId,
          location_id: stockLocationId,
          stocked_quantity: quantity,
        });
      }
    }
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    });
  }

  logger.info(
    `Created ${createdStockLocations} vendor stock location(s), linked ${linkedStockLocations} sales-channel and ${linkedFulfillmentProviders} provider relationship(s), and restored ${inventoryLevels.length} inventory level(s).`,
  );
}
