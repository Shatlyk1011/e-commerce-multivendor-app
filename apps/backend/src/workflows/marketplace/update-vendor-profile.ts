import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../modules/marketplace";
import MarketplaceModuleService from "../../modules/marketplace/service";

type UpdateVendorProfileInput = {
  vendorAdminId: string;
  first_name: string;
  last_name: string;
};

const updateVendorProfileStep = createStep(
  "update-vendor-profile",
  async (input: UpdateVendorProfileInput, { container }) => {
    const marketplaceService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);
    const previous = await marketplaceService.retrieveVendorAdmin(
      input.vendorAdminId,
    );
    const updated = await marketplaceService.updateVendorAdmins({
      id: input.vendorAdminId,
      first_name: input.first_name,
      last_name: input.last_name,
    });

    return new StepResponse(updated, {
      id: previous.id,
      first_name: previous.first_name,
      last_name: previous.last_name,
    });
  },
  async (previous, { container }) => {
    if (!previous) return;
    const marketplaceService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);
    await marketplaceService.updateVendorAdmins(previous);
  },
);

export const updateVendorProfileWorkflow = createWorkflow(
  "update-vendor-profile",
  function (input: UpdateVendorProfileInput) {
    const vendorAdmin = updateVendorProfileStep(input);
    return new WorkflowResponse({ vendorAdmin });
  },
);
