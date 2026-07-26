import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateOwnedReviewStep, type UpdateOwnedReviewInput } from "./steps/update-owned-review"

const updateOwnedReviewWorkflow = createWorkflow(
  "update-owned-review",
  function (input: UpdateOwnedReviewInput) {
    const review = updateOwnedReviewStep(input)
    return new WorkflowResponse({ review })
  },
)

export default updateOwnedReviewWorkflow
