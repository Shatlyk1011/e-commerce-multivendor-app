import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getCategoryDescendantsStep } from "./steps/get-category-descendants"
import { deleteCategoriesStep } from "./steps/delete-categories"

interface Input {
  id: string
}

export const cascadeDeleteCategoryWorkflow = createWorkflow(
  "cascade-delete-category",
  function (input: Input) {
    const deleteOrder = getCategoryDescendantsStep(input.id)
    const deletedIds = deleteCategoriesStep(deleteOrder)

    return new WorkflowResponse({
      deleted_ids: deletedIds,
    })
  }
)
