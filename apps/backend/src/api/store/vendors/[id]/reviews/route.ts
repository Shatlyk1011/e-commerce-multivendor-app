import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { STORE_REVIEW_MODULE } from "../../../../../modules/store-review";
import type StoreReviewModuleService from "../../../../../modules/store-review/service";
import { toPublicStoreReview } from "../../../../../lib/store-reviews";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: StoreReviewModuleService =
    req.scope.resolve(STORE_REVIEW_MODULE);
  const { limit, offset } = req.validatedQuery as {
    limit: number;
    offset: number;
  };
  const filters = { vendor_id: req.params.id };
  const [reviews, count] = await service.listAndCountStoreReviews(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC", id: "DESC" },
  });
  // Count each rating in the database; never load an unbounded review list for averages.
  const counts = await Promise.all(
    [1, 2, 3, 4, 5].map(async (rating) => {
      const [, total] = await service.listAndCountStoreReviews(
        { ...filters, rating },
        { take: 1, select: ["id"] },
      );
      return { rating, total };
    }),
  );
  const total = counts.reduce((sum, entry) => sum + entry.total, 0);
  const sum = counts.reduce(
    (value, entry) => value + entry.rating * entry.total,
    0,
  );
  res.json({
    reviews: reviews.map(toPublicStoreReview),
    count,
    limit,
    offset,
    summary: {
      review_count: total,
      average_rating: total ? Math.round((sum / total) * 10) / 10 : null,
    },
  });
}
