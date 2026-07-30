import {
  createWorkflow,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk";
import {
  setAuthAppMetadataStep,
  useQueryGraphStep,
  createStockLocationsWorkflow,
  createRemoteLinkStep,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import createVendorAdminStep from "./steps/create-vendor-admin";
import createVendorStep from "./steps/create-vendor";
import linkVendorStockLocationStep from "./steps/link-vendor-stock-location";
import requireDeliveryFulfillmentSetStep from "../steps/require-delivery-fulfillment-set";

export type CreateVendorWorkflowInput = {
  name: string;
  handle?: string;
  logo?: string;
  city: string;
  admin: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  authIdentityId: string;
};

const createVendorWorkflow = createWorkflow(
  "create-vendor",
  function (input: CreateVendorWorkflowInput) {
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["default_sales_channel_id"],
    }).config({ name: "retrieve-default-store" });

    const { data: fulfillmentSets } = useQueryGraphStep({
      entity: "fulfillment_set",
      fields: ["id"],
    }).config({ name: "retrieve-delivery-fulfillment-set" });
    const fulfillmentSetId = requireDeliveryFulfillmentSetStep({
      fulfillment_sets: fulfillmentSets,
    });

    const vendor = createVendorStep({
      name: input.name,
      handle: input.handle,
      logo: input.logo,
      city: input.city,
    });

    const vendorAdminData = transform(
      {
        input,
        vendor,
      },
      (data) => {
        return {
          ...data.input.admin,
          vendor_id: data.vendor.id,
        };
      },
    );

    const vendorAdmin = createVendorAdminStep(vendorAdminData);

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "vendor",
      value: vendorAdmin.id,
    });

    // Create a dedicated stock location for this vendor's physical store
    const stockLocationInput = transform({ input }, (data) => ({
      locations: [
        {
          name: `${data.input.name} - Склад`,
          address: {
            address_1: data.input.city,
            city: data.input.city,
            country_code: "tm",
          },
        },
      ],
    }));

    const stockLocations = createStockLocationsWorkflow.runAsStep({
      input: stockLocationInput,
    });

    // Save the stock location ID onto the vendor record
    const stockLocationLink = transform({ vendor, stockLocations }, (data) => ({
      vendor_id: data.vendor.id,
      stock_location_id: data.stockLocations[0].id,
    }));

    linkVendorStockLocationStep(stockLocationLink);

    // Shipping options are filtered by fulfillment sets attached to the sales
    // channel's stock locations. Every vendor location must use the delivery
    // set created during seeding or checkout has no eligible options.
    const fulfillmentSetLinkDefs = transform(
      { stockLocations, fulfillmentSetId },
      (data) => {
        return [
          {
            [Modules.STOCK_LOCATION]: {
              stock_location_id: data.stockLocations[0].id,
            },
            [Modules.FULFILLMENT]: {
              fulfillment_set_id: data.fulfillmentSetId,
            },
          },
        ];
      },
    );
    createRemoteLinkStep(fulfillmentSetLinkDefs).config({
      name: "link-vendor-location-to-fulfillment-set",
    });

    const providerLinkDefs = transform({ stockLocations }, (data) => [
      {
        [Modules.STOCK_LOCATION]: {
          stock_location_id: data.stockLocations[0].id,
        },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      },
    ]);
    createRemoteLinkStep(providerLinkDefs).config({
      name: "link-vendor-location-to-fulfillment-provider",
    });

    // Storefront inventory is calculated only from stock locations linked to
    // the product's sales channel. Include each vendor's location in the
    // store's default channel as soon as it is created.
    const salesChannelStockLocationLink = transform(
      { stockLocations, stores },
      (data) => {
        const defaultSalesChannelId = data.stores[0]?.default_sales_channel_id;

        return {
          id: data.stockLocations[0].id,
          add: defaultSalesChannelId ? [defaultSalesChannelId] : [],
        };
      },
    );

    when({ stores }, (data) =>
      Boolean(data.stores[0]?.default_sales_channel_id),
    ).then(() => {
      linkSalesChannelsToStockLocationWorkflow.runAsStep({
        input: salesChannelStockLocationLink,
      });
    });

    // @ts-ignore
    const { data: vendorWithAdmin } = useQueryGraphStep({
      entity: "vendor",
      fields: [
        "id",
        "name",
        "handle",
        "logo",
        "city",
        "stock_location_id",
        "admins.*",
      ],
      filters: {
        id: vendor.id,
      },
    });

    return new WorkflowResponse({
      vendor: vendorWithAdmin[0],
    });
  },
);

export default createVendorWorkflow;
