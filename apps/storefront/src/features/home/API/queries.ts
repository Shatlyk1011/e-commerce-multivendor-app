import type { HttpTypes } from '@medusajs/types'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { fetchProducts } from './client'

export type ProductFilters = {
  limit?: number
  offset?: number
  collection_id?: string
  q?: string
  category_id?: string | string[]
  order?: string
  fields?: string
  region_id?: string
  enabled?: boolean
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  infinite: (filters: Omit<ProductFilters, 'offset' | 'enabled'>) =>
    [...productKeys.lists(), 'infinite', filters] as const,
}

export function useProducts(filters?: ProductFilters) {
  return useQuery<HttpTypes.StoreProductListResponse>({
    queryKey: productKeys.list(filters ?? {}),
    queryFn: () => fetchProducts(filters),
    enabled: filters?.enabled ?? true,
  })
}

/** Fetch products in offset-based pages while preserving the Medusa response count. */
export function useInfiniteProducts(filters: Omit<ProductFilters, 'offset' | 'enabled'> = {}) {
  const limit = filters.limit ?? 12

  return useInfiniteQuery<HttpTypes.StoreProductListResponse, Error>({
    queryKey: productKeys.infinite(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchProducts({ ...filters, limit, offset: pageParam as number }),
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * limit
      return nextOffset < lastPage.count ? nextOffset : undefined
    },
  })
}
