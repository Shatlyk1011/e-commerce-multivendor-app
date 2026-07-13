import type { StoreCartResponse } from '@medusajs/types'

import { getCartId, removeCartId } from '@/lib/cart-cookies'
import { medusa } from '@/lib/medusa'

export async function createCart(): Promise<StoreCartResponse['cart']> {
  const { cart } = await medusa.store.cart.create({})
  return cart
}

export async function getCart(cartId?: string): Promise<StoreCartResponse['cart'] | null> {
  const id = cartId ?? getCartId()
  if (!id) return null
  try {
    const { cart } = await medusa.store.cart.retrieve(id)
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
