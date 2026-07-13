import type { HttpTypes } from '@medusajs/types'

// StoreProductCategory omits category_children/parent_category by default.
// When include_descendants_tree=true, these are included in the response.
// We use this local type to represent the full tree node.
export type CategoryTreeNode = HttpTypes.StoreProductCategory & {
  category_children: CategoryTreeNode[]
  parent_category: HttpTypes.StoreProductCategory | null
}
