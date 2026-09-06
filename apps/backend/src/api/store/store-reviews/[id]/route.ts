import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import updateStoreReviewWorkflow from "../../../../workflows/store-reviews/update-store-review";
import { toPublicStoreReview } from "../../../../lib/store-reviews";
import type { UpdateStoreReviewInput } from "../middlewares";

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateStoreReviewInput>,
  res: MedusaResponse,
) {
  const { result } = await updateStoreReviewWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
      review_id: req.params.id,
    },
  });
  res.json({ review: toPublicStoreReview(result) });
}
