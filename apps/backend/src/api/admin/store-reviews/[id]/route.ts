import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import moderateStoreReviewWorkflow from "../../../../workflows/store-reviews/moderate-store-review";
import type { ModerateStoreReviewInput } from "../middlewares";

export async function POST(
  req: AuthenticatedMedusaRequest<ModerateStoreReviewInput>,
  res: MedusaResponse,
) {
  const { result } = await moderateStoreReviewWorkflow(req.scope).run({
    input: { review_id: req.params.id, ...req.validatedBody },
  });
  res.json({ review: { id: result.id, status: result.status } });
}
