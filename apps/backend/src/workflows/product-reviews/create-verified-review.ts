import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createVerifiedReviewStep,
  type CreateVerifiedReviewInput,
} from "./steps/create-verified-review";

const createVerifiedReviewWorkflow = createWorkflow(
  "create-verified-review",
  function (input: CreateVerifiedReviewInput) {
    const review = createVerifiedReviewStep(input);
    return new WorkflowResponse({ review });
  },
);

export default createVerifiedReviewWorkflow;
