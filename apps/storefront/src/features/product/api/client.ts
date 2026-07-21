import type { HttpTypes } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

export type StoreProductWithInventory = Omit<HttpTypes.StoreProduct, 'variants'> & {
  variants: Array<
    HttpTypes.StoreProductVariant & {
      inventory_quantity?: number
      prices?: Array<{ amount: number; currency_code: string }> | null
    }
  > | null
}

export type StoreProductVendor = {
  id: string
  handle: string
  name: string
  logo: string | null
  store_name: string | null
  store_description: string | null
  address: string | null
  city: string | null
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

export async function fetchProduct(handleOrId: string): Promise<StoreProductWithInventory> {
  if (handleOrId.startsWith('prod_')) {
    try {
      const { product } = await medusa.store.product.retrieve(handleOrId, {
        fields: PRODUCT_DETAIL_FIELDS,
      })
      if (product) {
        return product as StoreProductWithInventory
      }
    } catch {
      // fallback to list query by handle
    }
  }

  const { products } = await medusa.store.product.list({
    handle: handleOrId,
    fields: PRODUCT_DETAIL_FIELDS,
  })

  if (products && products.length > 0) {
    return products[0] as StoreProductWithInventory
  }

  const { product } = await medusa.store.product.retrieve(handleOrId, {
    fields: PRODUCT_DETAIL_FIELDS,
  })

  return product as StoreProductWithInventory
}

export async function fetchProductVendor(handleOrId: string): Promise<StoreProductVendor | null> {
  const { vendor } = await medusa.client.fetch<{ vendor: StoreProductVendor | null }>(
    `/store/products/${handleOrId}/vendor`,
  )

  return vendor
}
