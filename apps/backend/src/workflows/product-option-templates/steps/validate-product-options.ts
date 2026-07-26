import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

import { PRODUCT_OPTION_TEMPLATE_MODULE } from "../../../modules/product-option-template"
import ProductOptionTemplateModuleService from "../../../modules/product-option-template/service"

type ProductOption = {
  title?: string
  values?: string[]
  id?: string
  value_ids?: string[]
}

export const validateProductOptionsStep = createStep(
  "validate-product-options",
  async (options: ProductOption[], { container }) => {
    if (options.length === 0) return new StepResponse(undefined)

    const service: ProductOptionTemplateModuleService = container.resolve(PRODUCT_OPTION_TEMPLATE_MODULE)
    const templates = await service.listProductOptionTemplates(
      { is_active: true },
      { relations: ["values"] }
    )

    const duplicateTitle = options.find((option, index) =>
      option.title && options.findIndex((candidate) => candidate.title === option.title) !== index
    )
    if (duplicateTitle) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `The option "${duplicateTitle.title}" was provided more than once.`)
    }

    for (const option of options) {
      if (!option.title || !option.values) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Product options must be selected from the administrator's catalogue.")
      }
      const template = templates.find((candidate) => candidate.title === option.title)
      if (!template) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `The option "${option.title}" is not available. Select an option configured by an administrator.`
        )
      }

      const allowedValues = new Set((template.values ?? []).map((value) => value.value))
      const invalidValue = option.values.find((value) => !allowedValues.has(value))
      if (invalidValue) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `The value "${invalidValue}" is not allowed for "${option.title}".`
        )
      }
    }

    return new StepResponse(undefined)
  }
)
