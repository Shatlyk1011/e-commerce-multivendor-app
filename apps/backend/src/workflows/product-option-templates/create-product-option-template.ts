import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import {
  createProductOptionTemplateStep,
  type CreateProductOptionTemplateInput,
} from "./steps/create-product-option-template";

const createProductOptionTemplateWorkflow = createWorkflow(
  "create-product-option-template",
  function (input: CreateProductOptionTemplateInput) {
    const template = createProductOptionTemplateStep(input);

    return new WorkflowResponse({ template });
  },
);

export default createProductOptionTemplateWorkflow;
