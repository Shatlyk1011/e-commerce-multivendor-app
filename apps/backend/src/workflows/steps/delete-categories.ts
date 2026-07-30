import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ModuleRegistrationName } from "@medusajs/framework/utils";

export const deleteCategoriesStep = createStep(
  "delete-categories",
  async (ids: string[], { container }) => {
    const productModuleService = container.resolve(
      ModuleRegistrationName.PRODUCT,
    );

    for (const id of ids) {
      await productModuleService.deleteProductCategories([id]);
    }

    return new StepResponse(ids);
  },
);
