import type { HttpTypes } from '@medusajs/types'

import { medusa } from '@/lib/medusa'

import { CategoryTreeNode } from './types'

const PRODUCT_PAGE_SIZE = 100

export async function fetchCategories(params?: {
  parent_category_id?: string | null
  include_descendants_tree?: boolean
}): Promise<CategoryTreeNode[]> {
  const response = await medusa.store.category.list({
    ...params,
    include_descendants_tree: params?.include_descendants_tree ?? true,
  })
  return (response.product_categories ?? []) as CategoryTreeNode[]
}

export async function fetchCategory(id: string): Promise<CategoryTreeNode> {
  const response = await medusa.store.category.retrieve(id, {
    include_descendants_tree: true,
  })
  return response.product_category as CategoryTreeNode
}

/**
 * Returns the catalog tree with empty branches removed. Ancestor categories are
 * kept when one of their descendants contains a store-visible product.
 */
export async function fetchCatalogCategories(): Promise<CategoryTreeNode[]> {
  const [categories, productCategoryIds] = await Promise.all([
    fetchCategories({ parent_category_id: null, include_descendants_tree: true }),
    fetchStoreProductCategoryIds(),
  ])

  return categories.flatMap((category) => filterEmptyCategoryBranches(category, productCategoryIds))
}

async function fetchStoreProductCategoryIds(): Promise<Set<string>> {
  const categoryIds = new Set<string>()
  let offset = 0
  let hasMoreProducts = true

  while (hasMoreProducts) {
    const response = await medusa.store.product.list({
      limit: PRODUCT_PAGE_SIZE,
      offset,
      fields: 'id,*categories',
    })

    for (const product of response.products) {
      for (const category of product.categories ?? []) {
        categoryIds.add(category.id)
      }
    }

    offset += response.products.length
    hasMoreProducts = response.products.length > 0 && offset < response.count
  }

  return categoryIds
}

function filterEmptyCategoryBranches(category: CategoryTreeNode, productCategoryIds: Set<string>): CategoryTreeNode[] {
  const categoryChildren = (category.category_children ?? []).flatMap((child) =>
    filterEmptyCategoryBranches(child, productCategoryIds),
  )

  if (!productCategoryIds.has(category.id) && categoryChildren.length === 0) {
    return []
  }

  return [{ ...category, category_children: categoryChildren }]
}

export async function fetchProductsByCategory(params?: {
  limit?: number
  offset?: number
  category_id?: string | string[]
}): Promise<HttpTypes.StoreProductListResponse> {
  const response = await medusa.store.product.list({
    limit: params?.limit,
    offset: params?.offset,
    category_id: params?.category_id,
  })
  return response
}
