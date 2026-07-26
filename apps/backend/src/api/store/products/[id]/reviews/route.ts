import type { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"
import createVerifiedReviewWorkflow from "../../../../../workflows/product-reviews/create-verified-review"
import type { CreateReviewSchema } from "./middlewares"

const getProductId = (req: MedusaRequest) => String(req.params.id)

const toReview = (review: Record<string, unknown>) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  author_name: review.author_name,
  verified_purchase: review.verified_purchase,
  created_at: review.created_at,
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reviewService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const productId = getProductId(req)
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  const [reviews, count] = await reviewService.listAndCountReviews(
    { product_id: productId, status: "published" },
    { take: limit, skip: offset, order: { created_at: "DESC" } },
  )
  const allPublishedReviews = await reviewService.listReviews({ product_id: productId, status: "published" })
  const distribution = [1, 2, 3, 4, 5].reduce<Record<number, number>>((result, rating) => {
    result[rating] = allPublishedReviews.filter((review) => review.rating === rating).length
    return result
  }, {})
  const average_rating = count
    ? Number((allPublishedReviews.reduce((sum, review) => sum + review.rating, 0) / count).toFixed(1))
    : null

  res.json({ reviews: reviews.map(toReview), count, offset, limit, summary: { average_rating, review_count: count, distribution } })
}

export async function POST(req: AuthenticatedMedusaRequest<CreateReviewSchema>, res: MedusaResponse) {
  const { result } = await createVerifiedReviewWorkflow(req.scope).run({
    input: {
      product_id: getProductId(req),
      customer_id: req.auth_context.actor_id,
      rating: req.validatedBody.rating,
      comment: req.validatedBody.comment,
    },
  })

  res.status(201).json({ review: toReview(result.review as Record<string, unknown>) })
}
