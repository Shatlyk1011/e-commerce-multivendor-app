import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

export type UpdateVendorStepInput = {
  id: string
  name?: string
  handle?: string
  logo?: string | null
  status?: "active" | "disabled"
  status_reason?: string | null
  store_name?: string | null
  store_description?: string | null
  address?: string | null
  city?: string | null
}

export const updateVendorStep = createStep(
  "update-vendor",
  async (input: UpdateVendorStepInput, { container }) => {

    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)

    // Retrieve original for compensation rollback
    const originalVendor = await marketplaceModuleService.retrieveVendor(input.id)

    const vendor = await marketplaceModuleService.updateVendors(input)

    return new StepResponse(vendor, originalVendor)
  },
  async (originalVendor, { container }) => {
    if (!originalVendor) return

    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)

    await marketplaceModuleService.updateVendors({
      id: originalVendor.id,
      name: originalVendor.name,
      handle: originalVendor.handle,
      logo: originalVendor.logo,
      status: originalVendor.status,
      status_reason: originalVendor.status_reason,
      store_name: originalVendor.store_name,
      store_description: originalVendor.store_description,
      address: originalVendor.address,
      city: originalVendor.city,
    })
  }
)
