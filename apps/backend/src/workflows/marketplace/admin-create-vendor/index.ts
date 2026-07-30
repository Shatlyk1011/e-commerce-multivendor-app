import { 
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { 
  setAuthAppMetadataStep,
  useQueryGraphStep,
  createStockLocationsWorkflow,
  createRemoteLinkStep,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { createVendorStep } from "./steps/create-vendor"
import { createVendorAdminStep } from "./steps/create-vendor-admin"
import { createAuthIdentityStep } from "./steps/create-auth-identity"
import linkVendorStockLocationStep from "../create-vendor/steps/link-vendor-stock-location"
import requireDeliveryFulfillmentSetStep from "../steps/require-delivery-fulfillment-set"

export type AdminCreateVendorWorkflowInput = {
  name: string
  handle: string
  logo?: string
  status?: "active" | "disabled"
  status_reason?: string | null
  store_name?: string | null
  store_description?: string | null
  address?: string | null
  city: string
  admin: {
    email: string
    password?: string
    first_name?: string
    last_name?: string
  }
}

export const adminCreateVendorWorkflow = createWorkflow(
  "admin-create-vendor",
  function (input: AdminCreateVendorWorkflowInput) {
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["default_sales_channel_id"],
    }).config({ name: "retrieve-default-store" })

    const { data: fulfillmentSets } = useQueryGraphStep({
      entity: "fulfillment_set",
      fields: ["id"],
    }).config({ name: "retrieve-delivery-fulfillment-set" })
    const fulfillmentSetId = requireDeliveryFulfillmentSetStep({ fulfillment_sets: fulfillmentSets })

    const vendor = createVendorStep({
      name: input.name,
      handle: input.handle,
      logo: input.logo,
      status: input.status,
      status_reason: input.status_reason,
      store_name: input.store_name,
      store_description: input.store_description,
      address: input.address,
      city: input.city,
    })

    const vendorAdminData = transform({
      input,
      vendor,
    }, (data) => {
      return {
        email: data.input.admin.email,
        first_name: data.input.admin.first_name,
        last_name: data.input.admin.last_name,
        vendor_id: data.vendor.id,
      }
    })

    const vendorAdmin = createVendorAdminStep(vendorAdminData)

    const authIdentityData = transform({
      input,
    }, (data) => {
      return {
        email: data.input.admin.email,
        password: data.input.admin.password,
      }
    })

    const authIdentity = createAuthIdentityStep(authIdentityData)

    setAuthAppMetadataStep({
      authIdentityId: authIdentity.id,
      actorType: "vendor",
      value: vendorAdmin.id,
    })

    const stockLocationInput = transform({ input }, (data) => ({
      locations: [{
        name: `${data.input.name} - Склад`,
        address: {
          address_1: data.input.city,
          city: data.input.city,
          country_code: "tm",
        },
      }],
    }))
    const stockLocations = createStockLocationsWorkflow.runAsStep({ input: stockLocationInput })

    const stockLocationLink = transform({ vendor, stockLocations }, (data) => ({
      vendor_id: data.vendor.id,
      stock_location_id: data.stockLocations[0].id,
    }))
    linkVendorStockLocationStep(stockLocationLink)

    const fulfillmentSetLinkDefs = transform({ stockLocations, fulfillmentSetId }, (data) => {
      return [{
        [Modules.STOCK_LOCATION]: { stock_location_id: data.stockLocations[0].id },
        [Modules.FULFILLMENT]: { fulfillment_set_id: data.fulfillmentSetId },
      }]
    })
    createRemoteLinkStep(fulfillmentSetLinkDefs).config({ name: "link-admin-vendor-location-to-fulfillment-set" })

    const providerLinkDefs = transform({ stockLocations }, (data) => [{
      [Modules.STOCK_LOCATION]: { stock_location_id: data.stockLocations[0].id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    }])
    createRemoteLinkStep(providerLinkDefs).config({ name: "link-admin-vendor-location-to-fulfillment-provider" })

    const salesChannelStockLocationLink = transform({ stockLocations, stores }, (data) => ({
      id: data.stockLocations[0].id,
      add: data.stores[0]?.default_sales_channel_id ? [data.stores[0].default_sales_channel_id] : [],
    }))
    linkSalesChannelsToStockLocationWorkflow.runAsStep({ input: salesChannelStockLocationLink })

    // @ts-ignore
    const { data: vendorWithAdmin } = useQueryGraphStep({
      entity: "vendor",
      fields: [
        "id", 
        "name", 
        "handle", 
        "logo", 
        "status", 
        "status_reason", 
        "store_name", 
        "store_description", 
        "address", 
        "city", 
        "admins.*"
      ],
      filters: {
        id: vendor.id,
      },
    })

    return new WorkflowResponse({
      vendor: vendorWithAdmin[0],
    })
  }
)

export default adminCreateVendorWorkflow
