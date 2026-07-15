import type { HttpTypes } from '@medusajs/types'
import { useQuery } from '@tanstack/react-query'

import { fetchProducts } from './client'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: {
    limit?: number
    offset?: number
    collection_id?: string
    q?: string
    category_id?: string | string[]
    order?: string
  }) => [...productKeys.lists(), filters] as const,
}

export function useProducts(filters?: {
  limit?: number
  offset?: number
  collection_id?: string
  q?: string
  category_id?: string | string[]
  order?: string
}) {
  return useQuery<HttpTypes.StoreProductListResponse>({
    queryKey: productKeys.list(filters ?? {}),
    queryFn: () => fetchProducts(filters),
  })
}
