import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import type { StoreReviewInput } from "@dtc/api-contracts";
import { STORE_REVIEW_MODULE } from "../../modules/store-review";
import type StoreReviewModuleService from "../../modules/store-review/service";

type Input = StoreReviewInput & { customer_id: string; review_id: string };

export const updateStoreReviewStep = createStep(
  "update-store-review",
  async (input: Input, { container }) => {
    const service: StoreReviewModuleService =
      container.resolve(STORE_REVIEW_MODULE);
    const [review] = await service.listStoreReviews(
      { id: input.review_id, customer_id: input.customer_id },
      { take: 1 },
    );
    if (!review) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Отзыв не найден.");
    }
    const updated = await service.updateStoreReviews({
      id: review.id,
      rating: input.rating,
      comment: input.comment,
    });
    return new StepResponse(updated, {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
    });
  },
  async (previous, { container }) => {
    if (previous) {
      const service: StoreReviewModuleService =
        container.resolve(STORE_REVIEW_MODULE);
      await service.updateStoreReviews(previous);
    }
  },
);

export default createWorkflow("update-store-review", function (input: Input) {
  return new WorkflowResponse(updateStoreReviewStep(input));
});
