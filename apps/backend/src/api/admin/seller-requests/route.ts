import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";
import MarketplaceModuleService from "../../../modules/marketplace/service";
import { z } from "@medusajs/framework/zod";

export const UpdateSellerRequestSchema = z.strictObject({
  status: z.enum(["new", "in_review", "approved", "rejected"]),
});
export type UpdateSellerRequestBody = z.infer<typeof UpdateSellerRequestSchema>;

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE);
  const { limit = "50", offset = "0" } = req.query as { limit?: string; offset?: string };
  const [seller_requests, count] = await service.listAndCountSellerRequests({}, {
    take: parseInt(limit, 10), skip: parseInt(offset, 10), order: { created_at: "DESC" },
  });
  res.json({ seller_requests, count, limit: parseInt(limit, 10), offset: parseInt(offset, 10) });
}
