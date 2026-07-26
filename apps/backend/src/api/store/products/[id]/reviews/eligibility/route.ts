import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../../modules/product-review/service"

type OrderWithItems = { id: string; payment_status?: string; fulfillment_status?: string; items?: Array<{ product_id?: string }> }

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const productId = String(req.params.id)
  const customerId = req.auth_context.actor_id
  const reviewService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const [existingReview] = await reviewService.listReviews({ product_id: productId, customer_id: customerId }, { take: 1 })
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "payment_status", "fulfillment_status", "items.product_id"],
    filters: {
      customer_id: customerId,
      status: "completed",
    },
    pagination: { take: 100, skip: 0 },
  }) as { data: OrderWithItems[] }

  const qualifyingOrder = orders.find(
    (order) => order.payment_status === "captured" && order.fulfillment_status === "fulfilled" && order.items?.some((item) => item.product_id === productId),
  )
  res.json({ can_review: Boolean(qualifyingOrder) && !existingReview, existing_review: Boolean(existingReview) })
}
