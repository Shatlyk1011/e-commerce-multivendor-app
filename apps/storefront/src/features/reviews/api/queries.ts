import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  createProductReview,
  getMyProductReviews,
  getProductReviewSummaries,
  getProductReviews,
  getReviewEligibility,
  updateProductReview,
} from './client'

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  eligibility: (productId: string) => [...reviewKeys.product(productId), 'eligibility'] as const,
  mine: (productIds: string[]) => [...reviewKeys.all, 'mine', productIds.join(',')] as const,
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: reviewKeys.product(productId),
    queryFn: () => getProductReviews(productId),
    enabled: Boolean(productId),
  })
}

export function useProductReviewSummaries(productIds: string[]) {
  const idsKey = productIds.join(',')
  return useQuery({
    queryKey: [...reviewKeys.all, 'summaries', idsKey],
    queryFn: () => getProductReviewSummaries(productIds),
    enabled: productIds.length > 0,
  })
}

export function useMyProductReviews(productIds: string[]) {
  return useQuery({
    queryKey: reviewKeys.mine(productIds),
    queryFn: () => getMyProductReviews(productIds),
    enabled: productIds.length > 0,
  })
}

export function useReviewEligibility(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: reviewKeys.eligibility(productId),
    queryFn: () => getReviewEligibility(productId),
    enabled: Boolean(productId) && enabled,
    retry: false,
  })
}

export function useCreateProductReview(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { rating: number; comment: string }) => createProductReview(productId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) })
      queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(productId) })
      queryClient.invalidateQueries({ queryKey: [...reviewKeys.all, 'mine'] })
      toast.success('Отзыв опубликован')
    },
    onError: (error: Error) => toast.error(error.message || 'Не удалось опубликовать отзыв'),
  })
}

export function useUpdateProductReview(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, rating, comment }: { reviewId: string; rating: number; comment: string }) =>
      updateProductReview(reviewId, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) })
      queryClient.invalidateQueries({ queryKey: [...reviewKeys.all, 'mine'] })
      toast.success('Отзыв обновлён')
    },
    onError: (error: Error) => toast.error(error.message || 'Не удалось обновить отзыв'),
  })
}
