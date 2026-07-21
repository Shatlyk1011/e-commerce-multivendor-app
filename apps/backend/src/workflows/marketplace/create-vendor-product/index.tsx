import { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { 
  createWorkflow, 
  transform, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { 
  createProductsWorkflow, 
  CreateProductsWorkflowInput, 
  createRemoteLinkStep, 
  useQueryGraphStep,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import { Modules } from "@medusajs/framework/utils"

type WorkflowInput = {
  vendor_admin_id: string
  product: CreateProductWorkflowInputDTO
}

const createVendorProductWorkflow = createWorkflow(
  "create-vendor-product",
  function (input: WorkflowInput) {
    // Retrieve default sales channel to make the product available in.
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["default_sales_channel_id"],
    })

    // Fetch vendor details including city and their dedicated stock location
    const { data: vendorAdmins } = useQueryGraphStep({
      entity: "vendor_admin",
      fields: [
        "vendor.id",
        "vendor.city",
        "vendor.stock_location_id",
      ],
      filters: {
        id: input.vendor_admin_id,
      },
    }).config({ name: "retrieve-vendor-admin" })

    const productData = transform({
      input,
      stores,
      vendorAdmins,
    }, (data) => {
      const deliveryCity = data.vendorAdmins[0]?.vendor?.city?.trim()

      if (!deliveryCity) {
        throw new Error("A vendor origin city is required before products can be created.")
      }

      return {
        products: [{
          ...data.input.product,
          metadata: {
            ...(data.input.product.metadata ?? {}),
            delivery_city: deliveryCity,
            delivery_scope: "origin_city",
          },
          sales_channels: [
            {
              id: data.stores[0].default_sales_channel_id,
            },
          ],
        }],
      }
    })

    const createdProducts = createProductsWorkflow.runAsStep({
      input: productData as CreateProductsWorkflowInput,
    })

    const linksToCreate = transform({
      input,
      createdProducts,
      vendorAdmins,
    }, (data) => {
      return data.createdProducts.map((product) => {
        return {
          [MARKETPLACE_MODULE]: {
            vendor_id: data.vendorAdmins[0].vendor.id,
          },
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
        }
      })
    })

    createRemoteLinkStep(linksToCreate)

    // Retrieve product variants and their automatically linked inventory items
    const { data: productsWithInventory } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "variants.id",
        "variants.sku",
        "variants.metadata",
        "variants.inventory_items.inventory_item_id",
      ],
      filters: {
        id: createdProducts[0].id,
      },
    }).config({ name: "retrieve-products-with-inventory" })

    // Build inventory levels using the vendor's own stock location
    const inventoryLevelsData = transform({
      productsWithInventory,
      vendorAdmins,
    }, (data) => {
      const locationId = data.vendorAdmins[0]?.vendor?.stock_location_id

      if (!locationId) {
        // No location set yet — inventory levels will be created when the
        // vendor gets a stock location assigned (i.e. after registration)
        return { inventory_levels: [] }
      }

      const levels: Array<{
        location_id: string
        stocked_quantity: number
        inventory_item_id: string
      }> = []

      const product = data.productsWithInventory[0]
      if (product && product.variants) {
        for (const variant of product.variants) {
          const invItem = variant.inventory_items?.[0]
          if (invItem && invItem.inventory_item_id) {
            const metadata = (variant.metadata ?? {}) as Record<string, unknown>
            const qty = Number(metadata.inventory_quantity)
            if (!isNaN(qty) && qty >= 0) {
              levels.push({
                location_id: locationId,
                stocked_quantity: qty,
                inventory_item_id: invItem.inventory_item_id,
              })
            }
          }
        }
      }

      return { inventory_levels: levels }
    })

    createInventoryLevelsWorkflow.runAsStep({
      input: inventoryLevelsData,
    })

    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["*", "variants.*"],
      filters: {
        id: createdProducts[0].id,
      },
    }).config({ name: "retrieve-products" })

    return new WorkflowResponse({
      product: products[0],
    })
  }
)

export default createVendorProductWorkflow
