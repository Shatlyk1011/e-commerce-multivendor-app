import type { StoreCartResponse } from '@medusajs/types'

import { getCartId, removeCartId } from '@/lib/cart-cookies'
import { medusa } from '@/lib/medusa'

const DEFAULT_COUNTRY_CODE = 'tm'

async function getDefaultRegionId(): Promise<string> {
  const { regions } = await medusa.store.region.list({
    fields: 'id,countries.iso_2',
  })
  const region = regions.find((item) =>
    item.countries?.some((country) => country.iso_2?.toLowerCase() === DEFAULT_COUNTRY_CODE),
  )

  if (!region) {
    throw new Error('Регион Туркменистана не настроен. Обратитесь в поддержку магазина.')
  }

  return region.id
}

export async function createCart(): Promise<StoreCartResponse['cart']> {
  const regionId = await getDefaultRegionId()
  const { cart } = await medusa.store.cart.create({
    region_id: regionId,
    shipping_address: { country_code: DEFAULT_COUNTRY_CODE },
  })
  return cart
}

export async function getCart(cartId?: string): Promise<StoreCartResponse['cart'] | null> {
  const id = cartId ?? getCartId()
  if (!id) return null
  try {
    const { cart } = await medusa.store.cart.retrieve(id, {
      fields:
        'id,currency_code,region_id,subtotal,total,shipping_total,discount_total,tax_total,shipping_address.*,billing_address.*,shipping_methods.*,items.id,items.title,items.subtitle,items.thumbnail,items.quantity,items.unit_price,items.product_id,items.variant_id,items.variant.title,items.variant.product.handle,items.variant.product.id,items.variant.options.value,items.variant.options.option.title',
    })

    if (!cart.region_id || !cart.shipping_address?.country_code) {
      const regionId = cart.region_id ?? (await getDefaultRegionId())
      await medusa.store.cart.update(cart.id, {
        region_id: regionId,
        shipping_address: cart.shipping_address ?? { country_code: DEFAULT_COUNTRY_CODE },
      })

      const { cart: regionalCart } = await medusa.store.cart.retrieve(id, {
        fields:
          'id,currency_code,region_id,subtotal,total,shipping_total,discount_total,tax_total,shipping_address.*,billing_address.*,shipping_methods.*,items.id,items.title,items.subtitle,items.thumbnail,items.quantity,items.unit_price,items.product_id,items.variant_id,items.variant.title,items.variant.product.handle,items.variant.product.id,items.variant.options.value,items.variant.options.option.title',
      })
      return regionalCart
    }

    return cart
  } catch {
    removeCartId()
    return null
  }
}

export async function addLineItem(
  cartId: string,
  payload: {
    variant_id: string
    quantity?: number
    title?: string
    thumbnail?: string
  },
): Promise<StoreCartResponse['cart']> {
  const { cart } = await medusa.store.cart.createLineItem(cartId, {
    variant_id: payload.variant_id,
    quantity: payload.quantity ?? 1,
  })
  return cart
}

export async function updateLineItem(
  cartId: string,
  lineId: string,
  payload: { quantity: number },
): Promise<StoreCartResponse['cart']> {
  const { cart } = await medusa.store.cart.updateLineItem(cartId, lineId, payload)
  return cart
}

export async function deleteLineItem(cartId: string, lineId: string): Promise<StoreCartResponse['cart']> {
  const { parent: cart } = await medusa.store.cart.deleteLineItem(cartId, lineId)
  return cart!
}
