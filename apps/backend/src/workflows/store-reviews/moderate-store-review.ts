import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { STORE_REVIEW_MODULE } from "../../modules/store-review";
import type StoreReviewModuleService from "../../modules/store-review/service";

type Input = {
  review_id: string;
  status: "approved" | "rejected";
  expected_rating: number;
  expected_comment: string;
};

const moderateStoreReviewStep = createStep(
  "moderate-store-review",
  async (input: Input, { container }) => {
    const service: StoreReviewModuleService = container.resolve(STORE_REVIEW_MODULE);
    const [review] = await service.listStoreReviews({ id: input.review_id }, { take: 1 });
    if (!review) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Отзыв не найден.");
    }
    if (review.rating !== input.expected_rating || review.comment !== input.expected_comment) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "Отзыв изменился. Обновите список и проверьте его снова.",
      );
    }
    const updated = await service.updateStoreReviews({
      id: review.id,
      status: input.status,
    });
    return new StepResponse(updated, { id: review.id, status: review.status });
  },
  async (previous, { container }) => {
    if (previous) {
      const service: StoreReviewModuleService = container.resolve(STORE_REVIEW_MODULE);
      await service.updateStoreReviews(previous);
    }
  },
);

export default createWorkflow("moderate-store-review", function (input: Input) {
  return new WorkflowResponse(moderateStoreReviewStep(input));
});
