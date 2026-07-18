import type { HttpTypes } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

export async function fetchProduct(id: string): Promise<HttpTypes.StoreProduct> {
  const { product } = await medusa.store.product.retrieve(id, {
    // Inventory is opt-in on Store product responses. The other product relations
    // are part of the standard response and are used directly by the detail page.
    fields: '+variants.inventory_quantity',
  })

  return product
}
