import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review";
import ProductReviewModuleService from "../../../../modules/product-review/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rawIds = req.query.product_ids;
  const productIds = (
    Array.isArray(rawIds) ? rawIds.join(",") : String(rawIds || "")
  )
    .split(",")
    .filter(Boolean)
    .slice(0, 100);
  const reviewService: ProductReviewModuleService = req.scope.resolve(
    PRODUCT_REVIEW_MODULE,
  );
  const reviews = productIds.length
    ? await reviewService.listReviews({
        product_id: productIds,
        status: "published",
      })
    : [];
  // Single-pass O(m): accumulate sum + count per product_id into a Map
  const aggregates = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    const entry = aggregates.get(review.product_id);
    if (entry) {
      entry.sum += review.rating;
      entry.count++;
    } else {
      aggregates.set(review.product_id, { sum: review.rating, count: 1 });
    }
  }

  // Single-pass O(n): build summaries from aggregates
  const summaries: Record<
    string,
    { average_rating: number | null; review_count: number }
  > = {};
  for (const productId of productIds) {
    const entry = aggregates.get(productId);
    summaries[productId] = entry
      ? {
          average_rating: Number((entry.sum / entry.count).toFixed(1)),
          review_count: entry.count,
        }
      : { average_rating: null, review_count: 0 };
  }

  res.json({ summaries });
}
