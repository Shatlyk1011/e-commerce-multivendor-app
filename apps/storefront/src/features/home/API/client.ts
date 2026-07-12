import { medusa } from "@/lib/medusa";
import type { HttpTypes } from "@medusajs/types";

export type { HttpTypes };

export async function fetchProducts(params?: {
  limit?: number;
  offset?: number;
  collection_id?: string;
}): Promise<HttpTypes.StoreProductListResponse> {
  return medusa.store.product.list({
    limit: params?.limit,
    offset: params?.offset,
    fields: "id,title,thumbnail,images.url,variants.calculated_price.*,collection.title,type.value,vendor.name,vendor.id",
    ...(params?.collection_id && { collection_id: params.collection_id }),
  } as any);
}
