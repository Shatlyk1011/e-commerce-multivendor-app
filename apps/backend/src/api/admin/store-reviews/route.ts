import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { STORE_REVIEW_MODULE } from "../../../modules/store-review";
import type StoreReviewModuleService from "../../../modules/store-review/service";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";
import type MarketplaceModuleService from "../../../modules/marketplace/service";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { status, limit, offset } = req.validatedQuery as {
    status: "pending" | "approved" | "rejected" | "all";
    limit: number;
    offset: number;
  };
  const service: StoreReviewModuleService = req.scope.resolve(STORE_REVIEW_MODULE);
  const [reviews, count] = await service.listAndCountStoreReviews(
    status === "all" ? {} : { status },
    { take: limit, skip: offset, order: { created_at: "DESC", id: "DESC" } },
  );
  const vendorIds = [...new Set(reviews.map((review) => review.vendor_id))];
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE);
  const vendors = vendorIds.length
    ? await marketplace.listVendors({ id: vendorIds }, { take: vendorIds.length })
    : [];
  const vendorNames = new Map(vendors.map((vendor) => [vendor.id, vendor.store_name || vendor.name]));

  res.json({
    reviews: reviews.map((review) => ({
      id: review.id,
      vendor_id: review.vendor_id,
      vendor_name: vendorNames.get(review.vendor_id) || review.vendor_id,
      order_id: review.order_id,
      author_name: review.author_name,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      created_at: review.created_at,
      updated_at: review.updated_at,
    })),
    count,
    limit,
    offset,
  });
}
