import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import createStoreReviewWorkflow from "../../../workflows/store-reviews/create-store-review";
import { toOwnedStoreReview } from "../../../lib/store-reviews";
import type { CreateStoreReviewInput } from "./middlewares";

export async function POST(
  req: AuthenticatedMedusaRequest<CreateStoreReviewInput>,
  res: MedusaResponse,
) {
  const { result } = await createStoreReviewWorkflow(req.scope).run({
    input: { ...req.validatedBody, customer_id: req.auth_context.actor_id },
  });
  res.status(201).json({ review: toOwnedStoreReview(result) });
}
