import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * Returns the public storefront profile for the vendor that owns a published
 * product. Vendor administration data remains private.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "vendor.id",
      "vendor.handle",
      "vendor.name",
      "vendor.logo",
      "vendor.store_name",
      "vendor.store_description",
      "vendor.address",
      "vendor.city",
    ],
    filters: {
      $or: [{ id: req.params.id }, { handle: req.params.id }],
      status: ProductStatus.PUBLISHED,
    },
  });

  return res.json({ vendor: product?.vendor ?? null });
}
