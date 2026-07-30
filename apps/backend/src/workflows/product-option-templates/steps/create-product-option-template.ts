import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

import { MedusaError } from "@medusajs/framework/utils";

import { PRODUCT_OPTION_TEMPLATE_MODULE } from "../../../modules/product-option-template";
import ProductOptionTemplateModuleService from "../../../modules/product-option-template/service";

export type CreateProductOptionTemplateInput = {
  title: string;
  values: string[];
};

export const createProductOptionTemplateStep = createStep(
  "create-product-option-template",
  async (input: CreateProductOptionTemplateInput, { container }) => {
    const service: ProductOptionTemplateModuleService = container.resolve(
      PRODUCT_OPTION_TEMPLATE_MODULE,
    );
    const template = await service.createProductOptionTemplates({
      title: input.title,
      is_active: true,
    });
    if (!template.id) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Unable to create product option template.",
      );
    }
    const values = await service.createProductOptionValues(
      input.values.map((value) => ({ value, template_id: template.id })),
    );

    return new StepResponse({ ...template, values }, template.id as string);
  },
  async (templateId, { container }) => {
    if (!templateId) return;
    const service: ProductOptionTemplateModuleService = container.resolve(
      PRODUCT_OPTION_TEMPLATE_MODULE,
    );
    await service.deleteProductOptionTemplates(templateId);
  },
);
