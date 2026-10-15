export type StoreReviewStatus = "pending" | "approved" | "rejected";

export type AdminStoreReview = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  order_id: string;
  author_name: string;
  rating: number;
  comment: string;
  status: StoreReviewStatus;
  created_at: string;
  updated_at: string;
};

export type AdminStoreReviewsResponse = {
  reviews: AdminStoreReview[];
  count: number;
  limit: number;
  offset: number;
};
