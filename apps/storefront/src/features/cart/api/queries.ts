import type { StoreCart } from '@medusajs/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
      let id = cartId || getCartId()
      if (!id) {
        const cart = await createCart()
        setCartId(cart.id)
        id = cart.id
      }
      try {
        return await addLineItem(id, payload)
      } catch (err) {
        // Fallback: if the cart was expired/deleted on the backend, create a new one
        const cart = await createCart()
        setCartId(cart.id)
        return await addLineItem(cart.id, payload)
      }
    },
    onSuccess: (updatedCart, variables) => {
      qc.setQueryData(cartKeys.all, updatedCart)
      const title = variables.payload.title || 'Товар'
      toast.success(`«${title}» добавлен в корзину`)
    },
    onError: () => {
      toast.error('Не удалось добавить товар в корзину')
    },
  })
}

export function useUpdateLineItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cartId,
      lineId,
      payload,
    }: {
      cartId?: string
      lineId: string
      payload: { quantity: number }
    }) => {
      const id = cartId || getCartId()
      if (!id) throw new Error('No cart')
      return updateLineItem(id, lineId, payload)
    },
    onSuccess: (updatedCart) => {
      qc.setQueryData(cartKeys.all, updatedCart)
    },
    onError: () => {
      toast.error('Не удалось обновить количество')
    },
  })
}

export function useDeleteLineItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ cartId, lineId }: { cartId?: string; lineId: string }) => {
      const id = cartId || getCartId()
      if (!id) throw new Error('No cart')
      return deleteLineItem(id, lineId)
    },
    onSuccess: (updatedCart, variables) => {
      const currentCart = qc.getQueryData<StoreCart>(cartKeys.all)
      const item = currentCart?.items?.find((i) => i.id === variables.lineId)
      const title = item?.title || 'Товар'
      qc.setQueryData(cartKeys.all, updatedCart)
      toast.success(`«${title}» удален из корзины`)
    },
    onError: () => {
      toast.error('Не удалось удалить товар из корзины')
    },
  })
}
