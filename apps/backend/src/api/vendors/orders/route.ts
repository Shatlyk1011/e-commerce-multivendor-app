import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"

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

  const normalized = Array.isArray(result)
    ? { orders: result, count: result.length, offset: 0, limit: result.length }
    : {
        orders: result.rows,
        count: result.metadata.count,
        offset: result.metadata.skip,
        limit: result.metadata.take,
      }

  res.json(normalized)
}
