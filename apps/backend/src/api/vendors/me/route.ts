import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

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
      message: `Account is disabled${reason}`
    })
  }

  // Update last login timestamp upon successful dashboard load
  await marketplaceService.updateVendorAdmins({
    id: vendorAdmin.id,
    last_login: new Date(),
  })

  res.json({
    vendor_admin: vendorAdmin,
  })
}
