import { medusa } from '@/lib/medusa'

export type ReviewSummary = {
  average_rating: number | null
  review_count: number
  distribution?: Record<number, number>
}
export type ProductReview = {
  id: string
  rating: number
  comment: string
  author_name: string
  verified_purchase: boolean
  created_at: string
}
export type MyProductReview = Pick<ProductReview, 'id' | 'rating' | 'comment' | 'created_at'> & { product_id: string }
export type ProductReviewsResponse = {
  reviews: ProductReview[]
  count: number
  offset: number
  limit: number
  summary: ReviewSummary
}
export type ReviewEligibility = { can_review: boolean; existing_review: boolean }

export function getProductReviews(productId: string) {
  return medusa.client.fetch<ProductReviewsResponse>(`/store/products/${productId}/reviews`)
}

export function getReviewEligibility(productId: string) {
  return medusa.client.fetch<ReviewEligibility>(`/store/products/${productId}/reviews/eligibility`)
}

export function getProductReviewSummaries(productIds: string[]) {
  return medusa.client.fetch<{ summaries: Record<string, ReviewSummary> }>('/store/reviews/summary', {
    query: { product_ids: productIds.join(',') },
  })
}

export function createProductReview(productId: string, body: { rating: number; comment: string }) {
  return medusa.client.fetch<{ review: ProductReview }>(`/store/products/${productId}/reviews`, {
    method: 'POST',
    body,
  })
}

export function updateProductReview(reviewId: string, body: { rating: number; comment: string }) {
  return medusa.client.fetch<{ review: MyProductReview }>(`/store/reviews/${reviewId}`, { method: 'POST', body })
}

export function getMyProductReviews(productIds: string[]) {
  return medusa.client.fetch<{ reviews: MyProductReview[] }>('/store/reviews/me', {
    query: { product_ids: productIds.join(',') },
  })
}
