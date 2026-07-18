import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import type { Vendor, VendorMeResponse } from "@dtc/api-contracts"

const toIsoString = (value: Date | string | null | undefined) =>
  value instanceof Date ? value.toISOString() : value

const toVendor = (vendor: {
  id: string
  name: string
  handle: string
  logo: string | null
  status: "active" | "disabled"
  status_reason: string | null
  store_name: string | null
  store_description: string | null
  address: string | null
  city: string | null
}): Vendor => ({
  id: vendor.id,
  name: vendor.name,
  handle: vendor.handle,
  logo: vendor.logo,
  status: vendor.status,
  status_reason: vendor.status_reason,
  store_name: vendor.store_name,
  store_description: vendor.store_description,
  address: vendor.address,
  city: vendor.city,
})

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["id", "email", "first_name", "last_name", "vendor.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

  if (!vendorAdmin) {
    return res.status(404).json({ message: "Vendor admin not found" })
  }

  // Enforce disabled status
  if (vendorAdmin.vendor?.status === "disabled") {
    const reason = vendorAdmin.vendor.status_reason ? `: ${vendorAdmin.vendor.status_reason}` : ""
    return res.status(403).json({
      message: `Аккаунт заблокирован. Причина: ${reason}`,
    });
  }

  // Update last login timestamp upon successful dashboard load
  await marketplaceService.updateVendorAdmins({
    id: vendorAdmin.id,
    last_login: new Date(),
  })

  const response: VendorMeResponse = {
    vendor_admin: {
      id: vendorAdmin.id,
      email: vendorAdmin.email,
      first_name: vendorAdmin.first_name,
      last_name: vendorAdmin.last_name,
      last_login: toIsoString(vendorAdmin.last_login),
      vendor: vendorAdmin.vendor ? toVendor(vendorAdmin.vendor) : undefined,
    },
  }

  res.json(response)
}
