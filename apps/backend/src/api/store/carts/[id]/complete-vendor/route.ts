import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import createVendorOrdersWorkflow from "../../../../../workflows/marketplace/create-vendor-orders"
import { buildDeliveryDetails, DELIVERY_METHODS } from "../../../../../lib/delivery"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"

export const CompleteVendorOrderSchema = z.strictObject({
  delivery_method: z.enum(DELIVERY_METHODS),
  pickup_point_id: z.string().min(1).optional(),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time_slot: z.string().min(1).max(32).optional(),
  recipient_phone: z.string().min(3).max(64).optional(),
  customer_note: z.string().max(500).optional(),
})

export type CompleteVendorOrderSchema = z.infer<typeof CompleteVendorOrderSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<CompleteVendorOrderSchema>,
  res: MedusaResponse
) => {
  const cartId = req.params.id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [cart] } = await query.graph({
    entity: "cart",
    fields: ["id", "customer_id"],
    filters: { id: cartId },
  })

  if (!cart || cart.customer_id !== req.auth_context.actor_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "You cannot complete this cart.")
  }

  const delivery = buildDeliveryDetails(req.validatedBody)

  const { result } = await createVendorOrdersWorkflow(req.scope)
    .run({
      input: {
        cart_id: cartId,
        delivery,
      },
    })

  res.json({
    type: "order",
    order: result.order,
    vendor_orders: result.vendorOrders,
  })
}
