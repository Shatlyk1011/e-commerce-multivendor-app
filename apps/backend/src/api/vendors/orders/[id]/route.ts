import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";
import type { VendorOrderResponse } from "@dtc/api-contracts";
import { toVendorOrder } from "../route";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.orders.id"],
    filters: { id: [req.auth_context.actor_id] },
  });

  const permittedOrderIds = new Set(
    vendorAdmin?.vendor?.orders
      ?.map((order) => order?.id)
      .filter((id): id is string => Boolean(id)) ?? [],
  );

  if (!permittedOrderIds.has(req.params.id)) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You cannot access this order.",
    );
  }

  const { result } = await getOrdersListWorkflow(req.scope).run({
    input: {
      fields: [
        "id",
        "display_id",
        "status",
        "fulfillment_status",
        "payment_status",
        "created_at",
        "email",
        "currency_code",
        "metadata",
        "total",
        "subtotal",
        "shipping_total",
        "tax_total",
        "discount_total",
        "items.*",
        "items.variant",
        "items.variant.product",
        "shipping_address.*",
        "shipping_methods",
        "fulfillments.*",
      ],
      variables: { filters: { id: req.params.id } },
    },
  });

  const order = Array.isArray(result) ? result[0] : result.rows[0];
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.");
  }

  const response: VendorOrderResponse = { order: toVendorOrder(order) };
  res.json(response);
};
