import type { OrderStoresResponse, OwnedStoreReview, StoreReviewInput, StoreReviewsResponse } from '@dtc/api-contracts'

import { medusa } from '@/lib/medusa'

export function getOrderStores(orderId: string) {
  return medusa.client.fetch<OrderStoresResponse>(`/store/orders/${orderId}/stores`)
}

export function getStoreReviews(vendorId: string, offset: number) {
  return medusa.client.fetch<StoreReviewsResponse>(`/store/vendors/${vendorId}/reviews`, {
    query: { limit: 10, offset },
  })
}

export function createStoreReview(orderId: string, body: StoreReviewInput) {
  return medusa.client.fetch<{ review: OwnedStoreReview }>('/store/store-reviews', {
    method: 'POST',
    body: { ...body, order_id: orderId },
  })
}

export function updateStoreReview(reviewId: string, body: StoreReviewInput) {
  return medusa.client.fetch<{ review: OwnedStoreReview }>(`/store/store-reviews/${reviewId}`, { method: 'POST', body })
}
