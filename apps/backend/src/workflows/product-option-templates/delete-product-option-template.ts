import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { deleteProductOptionTemplateStep } from "./steps/delete-product-option-template";

const deleteProductOptionTemplateWorkflow = createWorkflow(
  "delete-product-option-template",
  function (input: { id: string }) {
    const deleted = deleteProductOptionTemplateStep(input.id);

    return new WorkflowResponse(deleted);
  },
);

export default deleteProductOptionTemplateWorkflow;
