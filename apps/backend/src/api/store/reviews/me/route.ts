import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review"
import ProductReviewModuleService from "../../../../modules/product-review/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const rawIds = req.query.product_ids
  const productIds = (Array.isArray(rawIds) ? rawIds.join(",") : String(rawIds || ""))
    .split(",")
    .filter(Boolean)
    .slice(0, 100)
  const reviewService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const reviews = productIds.length
    ? await reviewService.listReviews({ customer_id: req.auth_context.actor_id, product_id: productIds })
    : []

  res.json({
    reviews: reviews.map((review) => ({
      id: review.id,
      product_id: review.product_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
    })),
  })
}
