export type StoreReview = {
  id: string
  rating: number
  comment: string
  author_name: string
  verified_purchase: boolean
  created_at: string
  updated_at: string
}

export type StoreReviewInput = { rating: number; comment: string }

export type OwnedStoreReview = StoreReview & { status: 'pending' | 'approved' | 'rejected' }

export type StoreReviewsResponse = {
  reviews: StoreReview[]
  count: number
  limit: number
  offset: number
  summary: { average_rating: number | null; review_count: number }
}

export type OrderStore = {
  order_id: string
  vendor: { id: string; name: string; logo: string | null }
  delivery_status: string | null
  can_review: boolean
  review: OwnedStoreReview | null
  items: Array<{ id: string; title: string; quantity: number; thumbnail: string | null }>
}

export type OrderStoresResponse = { stores: OrderStore[] }
