import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"

export type CreateVerifiedReviewInput = {
  product_id: string
  customer_id: string
  rating: number
  comment: string
}

type OrderWithItems = { id: string; payment_status?: string; fulfillment_status?: string; items?: Array<{ product_id?: string }> }

export const createVerifiedReviewStep = createStep(
  "create-verified-review",
  async (input: CreateVerifiedReviewInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const reviewService: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    const [existingReview] = await reviewService.listReviews(
      { product_id: input.product_id, customer_id: input.customer_id },
      { take: 1 },
    )

    if (existingReview) {
      throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "You have already reviewed this product")
    }

    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "payment_status", "fulfillment_status", "items.product_id"],
      filters: {
        customer_id: input.customer_id,
        status: "completed",
      },
      pagination: { take: 100, skip: 0 },
    }) as { data: OrderWithItems[] }

    const qualifyingOrder = orders.find(
      (order) => order.payment_status === "captured" && order.fulfillment_status === "fulfilled" && order.items?.some((item) => item.product_id === input.product_id),
    )
    if (!qualifyingOrder) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only customers with a delivered purchase can review this product",
      )
    }

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["first_name", "last_name"],
      filters: { id: input.customer_id },
      pagination: { take: 1, skip: 0 },
    })
    const customer = customers[0]
    const authorName = [customer?.first_name, customer?.last_name?.slice(0, 1)]
      .filter(Boolean)
      .join(" ") || "Покупатель"

    const review = await reviewService.createReviews({
      ...input,
      order_id: qualifyingOrder.id,
      author_name: authorName,
      status: "published",
      verified_purchase: true,
    })

    return new StepResponse(review, review.id)
  },
  async (reviewId, { container }) => {
    const reviewService: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    if (reviewId) {
      await reviewService.deleteReviews(reviewId)
    }
  },
)
