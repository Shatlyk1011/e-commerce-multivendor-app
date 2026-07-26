import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

import { PRODUCT_OPTION_TEMPLATE_MODULE } from "../../../modules/product-option-template"
import ProductOptionTemplateModuleService from "../../../modules/product-option-template/service"
import createProductOptionTemplateWorkflow from "../../../workflows/product-option-templates/create-product-option-template"

export const AdminCreateProductOptionTemplateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  values: z.array(z.string().trim().min(1).max(120)).min(1).max(100),
})

export type AdminCreateProductOptionTemplate = z.infer<typeof AdminCreateProductOptionTemplateSchema>

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: ProductOptionTemplateModuleService = req.scope.resolve(PRODUCT_OPTION_TEMPLATE_MODULE)
  const templates = await service.listProductOptionTemplates({}, { relations: ["values"], order: { title: "ASC" } })

  res.json({ product_option_templates: templates })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateProductOptionTemplate>,
  res: MedusaResponse
) {
  const values = [...new Set(req.validatedBody.values)]
  const { result } = await createProductOptionTemplateWorkflow(req.scope).run({
    input: { title: req.validatedBody.title, values },
  })

  res.status(201).json({ product_option_template: result.template })
}
