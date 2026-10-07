import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import type { HttpTypes } from "@medusajs/framework/types";
import createVendorProductWorkflow from "../../../workflows/marketplace/create-vendor-product";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { VendorProductsResponse } from "@dtc/api-contracts";
import {
  toVendorProduct,
  vendorProductFields,
  type VendorProductGraph,
} from "../../../lib/vendor-products";

type VendorCreateProduct = Omit<HttpTypes.AdminCreateProduct, "description">;

export const POST = async (
  req: AuthenticatedMedusaRequest<VendorCreateProduct>,
  res: MedusaResponse,
) => {
  const { result } = await createVendorProductWorkflow(req.scope).run({
    input: {
      vendor_admin_id: req.auth_context.actor_id,
      product: req.validatedBody,
    },
  });

  res.json({
    product: result.product,
  });
};

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: [...vendorProductFields],
    filters: {
      id: [
        // ID of the authenticated vendor admin
        req.auth_context.actor_id,
      ],
    },
  });

  const response: VendorProductsResponse = {
    products: (vendorAdmin?.vendor?.products ?? [])
      .filter(
        (product): product is NonNullable<typeof product> => product !== null,
      )
      .map((product) => toVendorProduct(product as VendorProductGraph)),
  };

  res.json(response);
};
