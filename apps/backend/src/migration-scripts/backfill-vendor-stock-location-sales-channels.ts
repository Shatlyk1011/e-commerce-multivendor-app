import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import { MARKETPLACE_MODULE } from "../modules/marketplace";
import MarketplaceModuleService from "../modules/marketplace/service";

type InventoryLevelInput = {
  inventory_item_id: string;
  location_id: string;
  stocked_quantity: number;
};

export default async function backfillVendorStockLocationSalesChannels({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const marketplaceService: MarketplaceModuleService =
    container.resolve(MARKETPLACE_MODULE);

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
      "products.variants.metadata",
      "products.variants.inventory_items.inventory_item_id",
    ],
  });
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "stock_locations.id"],
    filters: { id: defaultSalesChannelId },
  });

  const linkedStockLocationIds = new Set(
    salesChannels[0]?.stock_locations
      ?.map((stockLocation) => stockLocation?.id)
      .filter((stockLocationId): stockLocationId is string =>
        Boolean(stockLocationId),
      ) ?? [],
  );
  const vendorLocationIds = new Map<string, string>();
  let createdStockLocations = 0;
  let linkedStockLocations = 0;

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
    `Created ${createdStockLocations} vendor stock location(s), linked ${linkedStockLocations}, and restored ${inventoryLevels.length} inventory level(s).`,
  );
}
