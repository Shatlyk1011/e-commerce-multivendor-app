import type { HttpTypes } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

export type { HttpTypes }

export async function fetchProducts(params?: {
  limit?: number
  offset?: number
  collection_id?: string
  q?: string
  category_id?: string | string[]
  order?: string
}): Promise<HttpTypes.StoreProductListResponse> {
  return medusa.store.product.list({
    limit: params?.limit,
    offset: params?.offset,
    ...(params?.collection_id && { collection_id: params.collection_id }),
    ...(params?.q !== undefined && { q: params.q }),
    ...(params?.category_id && { category_id: params.category_id }),
    ...(params?.order && { order: params.order }),
  })
}
