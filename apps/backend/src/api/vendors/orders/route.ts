import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import type { VendorOrder, VendorOrdersResponse } from "@dtc/api-contracts"

const toIsoString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : value

const toVendorOrder = (order: {
  id: string
  display_id?: number | string | null
  status?: string | null
  fulfillment_status?: string | null
  payment_status?: string | null
  created_at: Date | string
  currency_code: string
  total?: unknown
  items?: Array<{
    id: string
    quantity: number
    title?: string | null
    variant?: {
      title?: string | null
      product?: {
        title?: string | null
      } | null
    } | null
  }> | null
  metadata?: Record<string, unknown> | null
}): VendorOrder => ({
  id: order.id,
  display_id: order.display_id ?? undefined,
  status: order.status ?? undefined,
  fulfillment_status: order.fulfillment_status ?? undefined,
  payment_status: order.payment_status ?? undefined,
  created_at: toIsoString(order.created_at),
  currency_code: order.currency_code,
  total: order.total == null ? undefined : Number(order.total),
  items: order.items?.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    title: item.title ?? undefined,
    variant: item.variant
      ? {
          title: item.variant.title ?? undefined,
          product: item.variant.product
            ? { title: item.variant.product.title ?? undefined }
            : undefined,
        }
      : undefined,
  })),
  metadata:
    typeof order.metadata?.parent_order_id === "string"
      ? { parent_order_id: order.metadata.parent_order_id }
      : undefined,
})

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.orders.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

  const { result } = await getOrdersListWorkflow(req.scope)
    .run({
      input: {
        fields: [
          "id",
          "display_id",
          "status",
          "fulfillment_status",
          "payment_status",
          "created_at",
          "updated_at",
          "email",
          "currency_code",
          "metadata",
          "total",
          "subtotal",
          "shipping_total",
          "tax_total",
          "items.*",
          "items.tax_lines",
          "items.adjustments",
          "items.variant",
          "items.variant.product",
          "items.detail",
          "shipping_methods",
          "payment_collections",
          "fulfillments.*",
        ],
        variables: {
          filters: {
            id: vendorAdmin.vendor.orders?.map((order) => order?.id),
          },
        },
      },
    })

  const normalized: VendorOrdersResponse = Array.isArray(result)
    ? { orders: result.map(toVendorOrder), count: result.length, offset: 0, limit: result.length }
    : {
        orders: result.rows.map(toVendorOrder),
        count: result.metadata.count,
        offset: result.metadata.skip,
        limit: result.metadata.take,
      }

  res.json(normalized)
}
