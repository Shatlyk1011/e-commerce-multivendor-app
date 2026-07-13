import type { HttpTypes } from '@medusajs/types'
import { useQuery } from '@tanstack/react-query'

import { fetchCategories, fetchCategory, fetchProductsByCategory } from './client'
import type { CategoryTreeNode } from './types'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: { parent_category_id?: string | null }) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

export function useCategories(filters?: { parent_category_id?: string | null }) {
  return useQuery<CategoryTreeNode[]>({
    queryKey: categoryKeys.list(filters ?? {}),
    queryFn: () => fetchCategories(filters),
  })
}

export function useCategory(id: string) {
  return useQuery<CategoryTreeNode>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  })
}

export function useProductsByCategory(params?: { limit?: number; offset?: number; category_id?: string | string[] }) {
  return useQuery<HttpTypes.StoreProductListResponse>({
    queryKey: ['products', 'category', params?.category_id ?? 'all', params?.offset ?? 0],
    queryFn: () => fetchProductsByCategory(params),
  })
}
