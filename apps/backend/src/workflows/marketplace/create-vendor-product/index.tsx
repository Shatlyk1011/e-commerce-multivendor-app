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
    // Alternatively, you can link sales channels to vendors and allow vendors
    // to manage sales channels
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["default_sales_channel_id"],
    })

    const { data: vendorAdmins } = useQueryGraphStep({
      entity: "vendor_admin",
      fields: ["vendor.id", "vendor.city"],
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
