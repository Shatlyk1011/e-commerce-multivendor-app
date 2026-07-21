import { useQuery } from '@tanstack/react-query'

import { fetchProduct } from './client'
import type { StoreProductWithInventory } from './client'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export function useProduct(id: string) {
  return useQuery<StoreProductWithInventory>({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: Boolean(id),
  })
}
