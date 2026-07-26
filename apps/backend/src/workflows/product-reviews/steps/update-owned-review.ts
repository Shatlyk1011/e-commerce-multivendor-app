import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"

export type UpdateOwnedReviewInput = {
  review_id: string
  customer_id: string
  rating: number
  comment: string
}

export const updateOwnedReviewStep = createStep(
  "update-owned-review",
  async (input: UpdateOwnedReviewInput, { container }) => {
    const reviewService: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    const review = await reviewService.retrieveReview(input.review_id)

    if (review.customer_id !== input.customer_id) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "You can only edit your own review")
    }

    const updatedReview = await reviewService.updateReviews({
      id: input.review_id,
      rating: input.rating,
      comment: input.comment,
    })

    return new StepResponse(updatedReview)
  },
)
