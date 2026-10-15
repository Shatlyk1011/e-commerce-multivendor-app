import type { HttpTypes } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

export type { HttpTypes }

export const PRODUCT_CARD_FIELDS = [
  '*variants.calculated_price',
  'id',
  'title',
  'handle',
  'thumbnail',
  'vendor.id',
  'vendor.name',
  'vendor.store_name',
  'variants.id',
  'variants.manage_inventory',
  'variants.allow_backorder',
  '+variants.inventory_quantity',
].join(',')

export const STOREFRONT_REGION_ID = 'reg_01KXGMKV3HG9ZR3WTV828AYM9A'

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
