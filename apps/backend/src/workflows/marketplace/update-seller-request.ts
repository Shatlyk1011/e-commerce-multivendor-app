import { createStep, StepResponse, createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../modules/marketplace";
import MarketplaceModuleService from "../../modules/marketplace/service";

export type UpdateSellerRequestInput = { id: string; status: "new" | "in_review" | "approved" | "rejected" };

export const updateSellerRequestStep = createStep(
  "update-seller-request",
  async (input: UpdateSellerRequestInput, { container }) => {
    const service: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);
    const original = await service.retrieveSellerRequest(input.id);
    const request = await service.updateSellerRequests(input);
    return new StepResponse(request, original);
  },
  async (original, { container }) => {
    if (!original) return;
    const service: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);
    await service.updateSellerRequests({ id: original.id, status: original.status });
  },
);

export const updateSellerRequestWorkflow = createWorkflow(
  "update-seller-request",
  function (input: UpdateSellerRequestInput) {
    return new WorkflowResponse(updateSellerRequestStep(input));
  },
);
