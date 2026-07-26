import type { HttpTypes } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

export type { HttpTypes }

export const HOME_PRODUCT_CARD_FIELDS = [
  'id',
  'title',
  'handle',
  'thumbnail',
  // 'variants.id',
  // 'variants.calculated_price',
].join(',')

export async function fetchProducts(params?: {
  limit?: number
  offset?: number
  collection_id?: string
  q?: string
  category_id?: string | string[]
  order?: string
  fields?: string
  region_id?: string
}): Promise<HttpTypes.StoreProductListResponse> {
  return medusa.store.product.list({
    limit: params?.limit,
    offset: params?.offset,
    ...(params?.collection_id && { collection_id: params.collection_id }),
    ...(params?.q !== undefined && { q: params.q }),
    ...(params?.category_id && { category_id: params.category_id }),
    ...(params?.order && { order: params.order }),
    ...(params?.fields && { fields: params.fields }),
    ...(params?.region_id && { region_id: params.region_id }),
  })
}
