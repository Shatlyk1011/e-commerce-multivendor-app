import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const { q, limit = "20", offset = "0" } = req.query as {
    q?: string
    limit?: string
    offset?: string
  }

  const [vendors, count] = await marketplaceService.listAndCountVendors(
    q ? { name: { $ilike: `%${q}%` } } : {},
    {
      take: parseInt(limit),
      skip: parseInt(offset),
      relations: ["admins"],
    }
  )

  res.json({
    vendors,
    count,
    limit: parseInt(limit),
    offset: parseInt(offset),
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const { name, handle, logo } = req.body as {
    name: string
    handle: string
    logo?: string
  }

  const vendor = await marketplaceService.createVendors({
    name,
    handle,
    logo: logo ?? null,
  })

  res.status(201).json({ vendor })
}
