export type SellerRequestStatus = "new" | "in_review" | "approved" | "rejected";
export type SellerRequest = {
  id: string; name: string; brand_name: string; business_type: "registered" | "in_progress" | "none";
  phone: string; address: string; status: SellerRequestStatus; created_at: string;
};
