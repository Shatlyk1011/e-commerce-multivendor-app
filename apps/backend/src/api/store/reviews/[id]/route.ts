import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import updateOwnedReviewWorkflow from "../../../../workflows/product-reviews/update-owned-review";
import type { CreateReviewSchema } from "../../products/[id]/reviews/middlewares";

const toReview = (review: Record<string, unknown>) => ({
  id: review.id,
  product_id: review.product_id,
  rating: review.rating,
  comment: review.comment,
  author_name: review.author_name,
  verified_purchase: review.verified_purchase,
  created_at: review.created_at,
});

export async function POST(
  req: AuthenticatedMedusaRequest<CreateReviewSchema>,
  res: MedusaResponse,
) {
  const { result } = await updateOwnedReviewWorkflow(req.scope).run({
    input: {
      review_id: String(req.params.id),
      customer_id: req.auth_context.actor_id,
      rating: req.validatedBody.rating,
      comment: req.validatedBody.comment,
    },
  });

  res.json({ review: toReview(result.review as Record<string, unknown>) });
}
