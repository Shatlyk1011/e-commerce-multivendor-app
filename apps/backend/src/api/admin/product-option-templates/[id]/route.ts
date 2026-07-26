import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import deleteProductOptionTemplateWorkflow from "../../../../workflows/product-option-templates/delete-product-option-template"

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await deleteProductOptionTemplateWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({ id: result.id, deleted: true })
}
