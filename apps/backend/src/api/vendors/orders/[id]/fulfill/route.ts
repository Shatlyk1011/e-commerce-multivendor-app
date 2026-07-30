import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.stock_location_id", "vendor.orders.id"],
    filters: { id: [req.auth_context.actor_id] },
  });

  const isOwner = vendorAdmin?.vendor?.orders?.some(
    (order) => order?.id === req.params.id,
  );
  if (!isOwner) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You cannot fulfill this order.",
    );
  }

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "metadata",
      "items.id",
      "items.quantity",
      "items.product_id",
      "shipping_methods.shipping_option_id",
    ],
    filters: { id: req.params.id },
  });

  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.");
  }

  const { result: fulfillment } = await createOrderFulfillmentWorkflow(
    req.scope,
  ).run({
    input: {
      order_id: order.id,
      items: (order.items ?? [])
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => ({ id: item.id, quantity: item.quantity })),
      location_id: vendorAdmin.vendor?.stock_location_id,
      shipping_option_id:
        order.shipping_methods?.[0]?.shipping_option_id ?? undefined,
      metadata: { fulfilled_by_vendor_admin_id: req.auth_context.actor_id },
    },
  });

  const parentOrderId =
    typeof order.metadata?.parent_order_id === "string"
      ? order.metadata.parent_order_id
      : undefined;

  // The parent order is the customer-facing record. When a vendor fulfills a
  // child order, fulfill the matching parent lines too so customer history and
  // the Admin order reflect partial/full progress accurately.
  if (parentOrderId) {
    const {
      data: [parentOrder],
    } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "items.id",
        "items.quantity",
        "items.product_id",
        "shipping_methods.shipping_option_id",
      ],
      filters: { id: parentOrderId },
    });
    const childProductIds = new Set(
      (order.items ?? []).flatMap((item) =>
        item?.product_id ? [item.product_id] : [],
      ),
    );
    const parentItems = (parentOrder?.items ?? [])
      .filter(
        (item): item is NonNullable<typeof item> =>
          Boolean(item) && childProductIds.has(item?.product_id ?? ""),
      )
      .map((item) => ({ id: item.id, quantity: item.quantity }));

    if (parentOrder && parentItems.length > 0) {
      await createOrderFulfillmentWorkflow(req.scope).run({
        input: {
          order_id: parentOrder.id,
          items: parentItems,
          location_id: vendorAdmin.vendor?.stock_location_id,
          shipping_option_id:
            parentOrder.shipping_methods?.[0]?.shipping_option_id ?? undefined,
          metadata: {
            fulfilled_by_vendor_admin_id: req.auth_context.actor_id,
            vendor_order_id: order.id,
          },
        },
      });
    }
  }

  res.status(200).json({ fulfillment });
};
