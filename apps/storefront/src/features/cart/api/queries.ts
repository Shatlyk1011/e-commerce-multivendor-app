import type { StoreCart, StoreCartLineItem } from '@medusajs/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getCartId, setCartId } from '@/lib/cart-cookies'

import { addLineItem, createCart, deleteLineItem, getCart, updateLineItem } from './client'

export const cartKeys = {
  all: ['cart'] as const,
  detail: (id: string) => [...cartKeys.all, id] as const,
}

export function useCart() {
  return useQuery<StoreCart | null>({
    queryKey: cartKeys.all,
    queryFn: async () => {
      const cartId = getCartId()
      if (!cartId) return null
      return getCart(cartId)
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCart,
    onSuccess: (cart) => {
      setCartId(cart.id)
      qc.setQueryData<StoreCart>(cartKeys.all, cart)
    },
  })
}

export function useAddLineItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cartId,
      payload,
    }: {
      cartId: string
      payload: { variant_id: string; quantity?: number; title?: string; thumbnail?: string }
    }) => {
      let id = cartId
      if (!id) {
        const cart = await createCart()
        setCartId(cart.id)
        id = cart.id
      }
      const existingCart = await getCart(id)
      if (!existingCart) {
        const cart = await createCart()
        setCartId(cart.id)
        id = cart.id
      }
      return addLineItem(id, payload)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}

export function useUpdateLineItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ lineId, payload }: { cartId: string; lineId: string; payload: { quantity: number } }) => {
      const cartId = getCartId()
      if (!cartId) throw new Error('No cart')
      return updateLineItem(cartId, lineId, payload)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}

export function useDeleteLineItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ lineId }: { cartId: string; lineId: string }) => {
      const cartId = getCartId()
      if (!cartId) throw new Error('No cart')
      return deleteLineItem(cartId, lineId)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all })
    },
  })
}
