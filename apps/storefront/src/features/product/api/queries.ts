import type { HttpTypes } from '@medusajs/types'
import { useQuery } from '@tanstack/react-query'

import { fetchProduct } from './client'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export function useProduct(id: string) {
  return useQuery<HttpTypes.StoreProduct>({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: Boolean(id),
  })
}
