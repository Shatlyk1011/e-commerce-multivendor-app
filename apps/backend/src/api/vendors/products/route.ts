import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { 
  HttpTypes,
} from "@medusajs/framework/types"
import createVendorProductWorkflow from "../../../workflows/marketplace/create-vendor-product"
import { 
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"
import type { VendorProduct, VendorProductsResponse } from "@dtc/api-contracts"

const toVendorProduct = (product: {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  status: string
}): VendorProduct => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  description: product.description,
  thumbnail: product.thumbnail,
  status: product.status,
})

export const POST = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProduct>,
  res: MedusaResponse
) => {
  const { result } = await createVendorProductWorkflow(req.scope)
    .run({
      input: {
        vendor_admin_id: req.auth_context.actor_id,
        product: req.validatedBody,
      },
    })

  res.json({
    product: result.product,
  })
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.products.*"],
    filters: {
      id: [
        // ID of the authenticated vendor admin
        req.auth_context.actor_id,
      ],
    },
  })

  const response: VendorProductsResponse = {
    products: (vendorAdmin?.vendor?.products ?? [])
      .filter((product): product is NonNullable<typeof product> => product !== null)
      .map(toVendorProduct),
  }

  res.json(response)
}
