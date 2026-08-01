import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";
import type {
  OrderDeliveryDetails,
  VendorOrder,
  VendorOrdersResponse,
} from "@dtc/api-contracts";
import type { VendorOrderOperationStatus } from "../../../lib/vendor-order-operation";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";
import MarketplaceModuleService from "../../../modules/marketplace/service";

const toIsoString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : value;

type OrderOperation = {
  status: VendorOrderOperationStatus;
  cancellation_reason?: string | null;
  updated_at?: Date | string;
  updated_by_vendor_admin_id: string;
};

const toVendorOrder = (order: {
  id: string;
  display_id?: number | string | null;
  status?: string | null;
  fulfillment_status?: string | null;
  payment_status?: string | null;
  created_at: Date | string;
  currency_code: string;
  total?: unknown;
  subtotal?: unknown;
  shipping_total?: unknown;
  tax_total?: unknown;
  discount_total?: unknown;
  items?: Array<{
    id: string;
    quantity: number;
    title?: string | null;
    unit_price?: unknown;
    thumbnail?: string | null;
    product_id?: string | null;
    variant?: {
      title?: string | null;
      product_id?: string | null;
      product?: {
        id?: string | null;
        title?: string | null;
        thumbnail?: string | null;
      } | null;
    } | null;
  }> | null;
  metadata?: Record<string, unknown> | null;
}, operation?: OrderOperation): VendorOrder => ({
  id: order.id,
  display_id: order.display_id ?? undefined,
  status: order.status ?? undefined,
  fulfillment_status: order.fulfillment_status ?? undefined,
  payment_status: order.payment_status ?? undefined,
  created_at: toIsoString(order.created_at),
  currency_code: order.currency_code,
  total: order.total == null ? undefined : Number(order.total),
  subtotal: order.subtotal == null ? undefined : Number(order.subtotal),
  shipping_total:
    order.shipping_total == null ? undefined : Number(order.shipping_total),
  tax_total: order.tax_total == null ? undefined : Number(order.tax_total),
  discount_total:
    order.discount_total == null ? undefined : Number(order.discount_total),
  items: order.items?.map((item) => {
    const productId =
      item.product_id ?? item.variant?.product_id ?? item.variant?.product?.id ?? undefined;
    return {
      id: item.id,
      quantity: item.quantity,
      title: item.title ?? undefined,
      unit_price: item.unit_price == null ? undefined : Number(item.unit_price),
      thumbnail: item.thumbnail ?? item.variant?.product?.thumbnail ?? undefined,
      product_id: productId,
      variant: item.variant
        ? {
            title: item.variant.title ?? undefined,
            product_id: item.variant.product_id ?? productId,
            product: item.variant.product
              ? {
                  id: item.variant.product.id ?? productId,
                  title: item.variant.product.title ?? undefined,
                  thumbnail: item.variant.product.thumbnail ?? undefined,
                }
              : undefined,
          }
        : undefined,
    };
  }),
  vendor_operation: operation
    ? {
        status: operation.status,
        reason: operation.cancellation_reason ?? undefined,
        updated_at: operation.updated_at ? toIsoString(operation.updated_at) : "",
        updated_by_vendor_admin_id: operation.updated_by_vendor_admin_id,
      }
    : undefined,
  metadata:
    typeof order.metadata?.parent_order_id === "string"
      ? { parent_order_id: order.metadata.parent_order_id }
      : undefined,
});

export { toVendorOrder };

function isDeliveryDetails(value: unknown): value is OrderDeliveryDetails {
  return Boolean(
    value &&
    typeof value === "object" &&
    "method" in value &&
    ((value as { method?: unknown }).method === "pickup" ||
      (value as { method?: unknown }).method === "courier"),
  );
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.orders.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  });

  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { result } = await getOrdersListWorkflow(req.scope).run({
    input: {
      fields: [
        "id",
        "display_id",
        "status",
        "fulfillment_status",
        "payment_status",
        "created_at",
        "updated_at",
        "currency_code",
        "metadata",
        "total",
        "subtotal",
        "shipping_total",
        "tax_total",
        "items.*",
        "items.product_id",
        "items.tax_lines",
        "items.adjustments",
        "items.variant",
        "items.variant.product_id",
        "items.variant.product",
        "items.variant.product.id",
        "items.variant.product.thumbnail",
        "items.detail",
        "items.unit_price",
        "items.thumbnail",
        "payment_collections",
        "fulfillments.*",
      ],
      variables: {
        filters: {
          id: vendorAdmin.vendor.orders?.map((order) => order?.id),
        },
        skip: offset,
        take: limit,
      },
    },
  });

  const orders = Array.isArray(result) ? result : result.rows;
  const marketplaceModuleService: MarketplaceModuleService = req.scope.resolve(
    MARKETPLACE_MODULE,
  );
  const operations = await marketplaceModuleService.listVendorOrderOperations({
    order_id: orders.map((order) => order.id),
  });
  const operationsByOrderId = new Map(
    operations.map((operation) => [operation.order_id, operation]),
  );

  const normalized: VendorOrdersResponse = Array.isArray(result)
    ? {
        orders: result.map((order) =>
          toVendorOrder(order, operationsByOrderId.get(order.id)),
        ),
        count: result.length,
        offset: 0,
        limit: result.length,
      }
    : {
        orders: result.rows.map((order) =>
          toVendorOrder(order, operationsByOrderId.get(order.id)),
        ),
        count: result.metadata.count,
        offset: result.metadata.skip,
        limit: result.metadata.take,
      };

  res.json(normalized);
};
