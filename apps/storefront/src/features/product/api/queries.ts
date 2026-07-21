import { useQuery } from '@tanstack/react-query'

import { fetchProduct, fetchProductVendor } from './client'
import type { StoreProductVendor, StoreProductWithInventory } from './client'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  vendor: (id: string) => [...productKeys.detail(id), 'vendor'] as const,
}

export function useProduct(id: string) {
  return useQuery<StoreProductWithInventory>({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: Boolean(id),
  })
}

export function useProductVendor(id: string) {
  return useQuery<StoreProductVendor | null>({
    queryKey: productKeys.vendor(id),
    queryFn: () => fetchProductVendor(id),
    enabled: Boolean(id),
  })
}
