import type { StoreCart } from '@medusajs/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getCartId, removeCartId, setCartId } from '@/lib/cart-cookies'

import { addLineItem, createCart, deleteLineItem, getCart, getOrCreateCartId, updateLineItem } from './client'

export const cartKeys = {
  all: ['cart'] as const,
  detail: (id: string) => [...cartKeys.all, id] as const,
}

function isCartNotFoundError(error: any): boolean {
  const status = error?.status || error?.response?.status
  if (status === 404) return true

  const rawMessage = error?.response?.data?.message || error?.message || (typeof error === 'string' ? error : '')
  if (typeof rawMessage === 'string' && rawMessage.length > 0) {
    const lower = rawMessage.toLowerCase()
    return lower.includes('not found') || lower.includes('does not exist') || lower.includes('cart with id')
  }
  return false
}

function getCartErrorMessage(error: any, defaultMsg: string): string | null {
  const rawMessage = error?.response?.data?.message || error?.message || (typeof error === 'string' ? error : '')

  console.log('rawMessage', rawMessage)
  if (!rawMessage) return defaultMsg

  const lower = rawMessage.toLowerCase()

  if (lower.includes('variant does not have the required inventory')) {
    return null
  }

  if (
    lower.includes('inventory') ||
    lower.includes('stock') ||
    lower.includes('exceed') ||
    lower.includes('insufficient') ||
    lower.includes('available') ||
    lower.includes('max')
  ) {
    return 'Достигнуто максимальное количество товара в наличии'
  }

  return rawMessage
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
      cartId?: string
      payload: { variant_id: string; quantity?: number; title?: string; thumbnail?: string }
    }) => {
      let id = cartId && cartId.trim().length > 0 ? cartId : getCartId()
      if (!id) {
        id = await getOrCreateCartId()
      }
      try {
        return await addLineItem(id, payload)
      } catch (err: any) {
        // Fallback: ONLY if the cart was expired/deleted on the backend (404 Not Found), create a new one
        if (isCartNotFoundError(err)) {
          removeCartId()
          const newCartId = await getOrCreateCartId()
          return await addLineItem(newCartId, payload)
        }
        throw err
      }
    },
    onSuccess: (updatedCart, variables) => {
      qc.setQueryData(cartKeys.all, updatedCart)
      const title = variables.payload.title || 'Товар'
      toast.success(`«${title}» добавлен в корзину`)
    },
    onError: (error: any) => {
      const message = getCartErrorMessage(error, 'Не удалось добавить товар в корзину')
      if (message) {
        toast.error(message)
      }
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
    onError: (error: any) => {
      const message = getCartErrorMessage(error, 'Не удалось обновить количество')
      toast.error(message)
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
    onError: (error: any) => {
      const message = getCartErrorMessage(error, 'Не удалось удалить товар из корзины')
      toast.error(message)
    },
  })
}
