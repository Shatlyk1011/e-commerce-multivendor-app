import { createStep, StepResponse, createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../modules/marketplace";
import MarketplaceModuleService from "../../modules/marketplace/service";

export type CreateSellerRequestInput = {
  name: string;
  brand_name: string;
  business_type: "registered" | "in_progress" | "none";
  phone: string;
  address: string;
};

export const createSellerRequestStep = createStep(
  "create-seller-request",
  async (input: CreateSellerRequestInput, { container }) => {
    const service: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);
    const request = await service.createSellerRequests(input);
    return new StepResponse(request, request);
  },
  async (request, { container }) => {
    if (!request) return;
    const service: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);
    await service.deleteSellerRequests(request.id);
  },
);

export const createSellerRequestWorkflow = createWorkflow(
  "create-seller-request",
  function (input: CreateSellerRequestInput) {
    return new WorkflowResponse(createSellerRequestStep(input));
  },
);
