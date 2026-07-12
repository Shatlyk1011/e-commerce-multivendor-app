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
  min_price?: number;
  max_price?: number;
}): Promise<HttpTypes.StoreProductListResponse> {
  const response = await medusa.store.product.list({
    limit: params?.limit,
    offset: params?.offset,
    category_id: params?.category_id,
  });

  let products = response.products ?? [];

  if (params?.min_price !== undefined || params?.max_price !== undefined) {
    products = products.filter((p) => {
      const price = p.variants?.[0]?.calculated_price?.calculated_amount;
      if (price === undefined) return false;
      if (params.min_price !== undefined && Number(price) < params.min_price) return false;
      if (params.max_price !== undefined && Number(price) > params.max_price) return false;
      return true;
    });
  }

  return { ...response, products };
}
