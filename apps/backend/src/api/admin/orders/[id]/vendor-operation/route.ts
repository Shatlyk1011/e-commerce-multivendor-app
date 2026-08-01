import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace";
import MarketplaceModuleService from "../../../../../modules/marketplace/service";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
    MARKETPLACE_MODULE,
  );
  const [operation] = await marketplaceModuleService.listVendorOrderOperations({
    order_id: req.params.id,
  });

  res.json({ operation: operation ?? null });
};
