import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateSellerRequestWorkflow } from "../../../../workflows/marketplace/update-seller-request";
import type { UpdateSellerRequestBody } from "../route";

export async function PATCH(req: AuthenticatedMedusaRequest<UpdateSellerRequestBody>, res: MedusaResponse) {
  const { result } = await updateSellerRequestWorkflow(req.scope).run({ input: { id: req.params.id, status: req.validatedBody.status } });
  res.json({ seller_request: result });
}
