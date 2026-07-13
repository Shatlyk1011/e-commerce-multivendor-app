import { medusa } from "@/lib/medusa";
import type { HttpTypes } from "@medusajs/types";
import { CategoryTreeNode } from "./types";

export async function fetchCategories(params?: {
  parent_category_id?: string | null;
  include_descendants_tree?: boolean;
}): Promise<CategoryTreeNode[]> {
  const response = await medusa.store.category.list({
    ...params,
    include_descendants_tree: params?.include_descendants_tree ?? true,
  });
  return (response.product_categories ?? []) as CategoryTreeNode[];
}

export async function fetchCategory(id: string): Promise<CategoryTreeNode> {
  const response = await medusa.store.category.retrieve(id, {
    include_descendants_tree: true,
  });
  return response.product_category as CategoryTreeNode;
}

export async function fetchProductsByCategory(params?: {
  limit?: number;
  offset?: number;
  category_id?: string | string[];
}): Promise<HttpTypes.StoreProductListResponse> {
  const response = await medusa.store.product.list({
    limit: params?.limit,
    offset: params?.offset,
    category_id: params?.category_id,
  });
  return response;
}
