import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const { id } = req.params

  const vendor = await marketplaceService.retrieveVendor(id, {
    relations: ["admins"],
  })

  res.json({ vendor })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const { id } = req.params
  const { name, handle, logo } = req.body as {
    name?: string
    handle?: string
    logo?: string | null
  }

  const vendor = await marketplaceService.updateVendors({
    id,
    ...(name !== undefined && { name }),
    ...(handle !== undefined && { handle }),
    ...(logo !== undefined && { logo }),
  })

  res.json({ vendor })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const { id } = req.params

  await marketplaceService.deleteVendors(id)

  res.json({ id, object: "vendor", deleted: true })
}
