import type { HttpTypes } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

export type StoreProductWithInventory = HttpTypes.StoreProduct & {
  variants: Array<HttpTypes.StoreProductVariant & { inventory_quantity?: number }> | null
}

const PRODUCT_DETAIL_FIELDS = [
  'id',
  'title',
  'handle',
  'description',
  'thumbnail',
  'status',
  'metadata',
  'weight',
  'length',
  'width',
  'height',
  'origin_country',
  'material',
  'categories.id',
  'categories.name',
  'images.id',
  'images.url',
  'options.id',
  'options.title',
  'options.values.id',
  'options.values.value',
  'variants.id',
  'variants.title',
  'variants.sku',
  'variants.barcode',
  'variants.manage_inventory',
  '+variants.inventory_quantity',
  'variants.options.id',
  'variants.options.value',
  'variants.options.option.id',
  'variants.options.option.title',
  'variants.prices.id',
  'variants.prices.amount',
  'variants.prices.currency_code',
].join(',')

export async function fetchProduct(id: string): Promise<StoreProductWithInventory> {
  const { product } = await medusa.store.product.retrieve(id, {
    fields: PRODUCT_DETAIL_FIELDS,
  })

  return product as StoreProductWithInventory
}
