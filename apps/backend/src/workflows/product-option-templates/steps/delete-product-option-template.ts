import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { PRODUCT_OPTION_TEMPLATE_MODULE } from "../../../modules/product-option-template"
import ProductOptionTemplateModuleService from "../../../modules/product-option-template/service"

export const deleteProductOptionTemplateStep = createStep(
  "delete-product-option-template",
  async (id: string, { container }) => {
    const service: ProductOptionTemplateModuleService = container.resolve(PRODUCT_OPTION_TEMPLATE_MODULE)
    const template = await service.retrieveProductOptionTemplate(id, { relations: ["values"] })
    await service.deleteProductOptionTemplates(id)

    return new StepResponse({ id }, template)
  },
  async (template, { container }) => {
    if (!template) return
    const service: ProductOptionTemplateModuleService = container.resolve(PRODUCT_OPTION_TEMPLATE_MODULE)
    const restored = await service.createProductOptionTemplates({
      id: template.id,
      title: template.title,
      is_active: template.is_active,
    })
    await service.createProductOptionValues(
      (template.values ?? []).map((value) => ({ value: value.value, template_id: restored.id }))
    )
  }
)
