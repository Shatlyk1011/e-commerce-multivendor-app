import type { StoreReviewInput } from '@dtc/api-contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/features/auth/components/AuthProvider'

import { createStoreReview, getOrderStores, getStoreReviews, updateStoreReview } from './client'

export const storeReviewKeys = {
  all: ['store-reviews'] as const,
  vendor: (vendorId: string) => ['store-reviews', 'vendor', vendorId] as const,
  orders: ['account', 'store-reviews'] as const,
}

export function useOrderStores(orderId: string) {
  const { customer } = useAuth()
  return useQuery({
    queryKey: [...storeReviewKeys.orders, customer?.id, orderId],
    queryFn: () => getOrderStores(orderId),
    enabled: Boolean(customer && orderId),
    refetchOnMount: 'always',
    refetchInterval: 30_000,
  })
}

export function useStoreReviews(vendorId: string, offset: number) {
  return useQuery({
    queryKey: [...storeReviewKeys.vendor(vendorId), offset],
    queryFn: () => getStoreReviews(vendorId, offset),
  })
}

export function useSaveStoreReview(vendorId: string, orderId: string, reviewId?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: StoreReviewInput) =>
      reviewId ? updateStoreReview(reviewId, body) : createStoreReview(orderId, body),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: storeReviewKeys.orders }),
        client.invalidateQueries({ queryKey: storeReviewKeys.vendor(vendorId) }),
      ])
      toast.success(reviewId ? 'Отзыв о магазине обновлён' : 'Отзыв о магазине опубликован')
    },
    onError: () => {
      // Refresh eligibility after a concurrent submission or delivery-status change.
      client.invalidateQueries({ queryKey: storeReviewKeys.orders })
    },
  })
}
