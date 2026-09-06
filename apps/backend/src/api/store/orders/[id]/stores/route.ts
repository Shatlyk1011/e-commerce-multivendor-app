import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { getOrderStores } from "../../../../../lib/store-reviews";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const stores = await getOrderStores(
    req.scope,
    req.params.id,
    req.auth_context.actor_id,
  );
  res.json({ stores });
}
