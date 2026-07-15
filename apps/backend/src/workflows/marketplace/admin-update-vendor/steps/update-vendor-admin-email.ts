import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { Modules, MedusaError } from "@medusajs/framework/utils"

export type UpdateVendorAdminEmailStepInput = {
  vendorAdminId: string
  oldEmail: string
  newEmail: string
}

export const updateVendorAdminEmailStep = createStep(
  "update-vendor-admin-email",
  async (input: UpdateVendorAdminEmailStepInput, { container }) => {

    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)
    const authService = container.resolve(Modules.AUTH)

    if (input.oldEmail.toLowerCase() === input.newEmail.toLowerCase()) {
      return new StepResponse({ updated: false }, null)
    }

    // Check if new email is already in use by another provider identity
    const [existing] = await authService.listProviderIdentities({
      entity_id: input.newEmail,
      provider: "emailpass",
    })

    if (existing) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Email ${input.newEmail} is already in use`
      )
    }


    // 1. Update VendorAdmin in marketplace module
    await marketplaceModuleService.updateVendorAdmins({
      id: input.vendorAdminId,
      email: input.newEmail,
    })

    // 2. Find provider identity for oldEmail
    const [providerIdentity] = await authService.listProviderIdentities({
      entity_id: input.oldEmail,
      provider: "emailpass",
    })

    if (providerIdentity) {
      await authService.updateProviderIdentities({
        id: providerIdentity.id,
        entity_id: input.newEmail,
      })
    }

    return new StepResponse(
      { updated: true },
      {
        vendorAdminId: input.vendorAdminId,
        oldEmail: input.oldEmail,
        newEmail: input.newEmail,
        providerIdentityId: providerIdentity?.id,
      }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData || !compensationData.providerIdentityId) return

    const marketplaceModuleService: MarketplaceModuleService = 
      container.resolve(MARKETPLACE_MODULE)
    const authService = container.resolve(Modules.AUTH)

    // Rollback vendor admin email
    await marketplaceModuleService.updateVendorAdmins({
      id: compensationData.vendorAdminId,
      email: compensationData.oldEmail,
    })

    // Rollback provider identity entity_id
    await authService.updateProviderIdentities({
      id: compensationData.providerIdentityId,
      entity_id: compensationData.oldEmail,
    })
  }
)
export default updateVendorAdminEmailStep
