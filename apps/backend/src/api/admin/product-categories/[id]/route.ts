import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { cascadeDeleteCategoryWorkflow } from "../../../../workflows/cascade-delete-category";

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { id } = req.params;

  const { result } = await cascadeDeleteCategoryWorkflow(req.scope).run({
    input: { id },
  });

  res.json({
    id,
    object: "product_category",
    deleted: true,
    deleted_count: result.deleted_ids.length,
  });
}
