import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { createSellerRequestWorkflow } from "../../../workflows/marketplace/create-seller-request";

export const CreateSellerRequestSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  brand_name: z.string().trim().min(1).max(160),
  business_type: z.enum(["registered", "in_progress", "none"]),
  phone: z.string().trim().min(5).max(40),
  address: z.string().trim().min(1).max(500),
});
export type CreateSellerRequestBody = z.infer<typeof CreateSellerRequestSchema>;

export async function POST(req: MedusaRequest<CreateSellerRequestBody>, res: MedusaResponse) {
  const { result } = await createSellerRequestWorkflow(req.scope).run({ input: req.validatedBody });
  res.status(201).json({ seller_request: result });
}
