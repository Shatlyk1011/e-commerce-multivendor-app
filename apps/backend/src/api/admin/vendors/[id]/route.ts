import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"
import { z } from "@medusajs/framework/zod"
import adminUpdateVendorWorkflow from "../../../../workflows/marketplace/admin-update-vendor"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const { id } = req.params

  const vendor = await marketplaceService.retrieveVendor(id, {
    relations: ["admins"],
  })

  res.json({ vendor })
}

export const AdminUpdateVendorSchema = z.strictObject({
  name: z.string().optional(),
  handle: z.string().optional(),
  logo: z.string().nullable().optional(),
  status: z.enum(["active", "disabled"]).optional(),
  status_reason: z.string().nullable().optional(),
  store_name: z.string().nullable().optional(),
  store_description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().trim().min(1, "City cannot be empty").optional(),
  admin: z.strictObject({
    id: z.string(),
    email: z.string().email().optional(),
    oldEmail: z.string().email().optional(),
  }).optional(),
})

type RequestBody = z.infer<typeof AdminUpdateVendorSchema>

export async function PATCH(req: AuthenticatedMedusaRequest<RequestBody>, res: MedusaResponse) {
  const { id } = req.params

  const { result } = await adminUpdateVendorWorkflow(req.scope).run({
    input: {
      id,
      ...req.validatedBody,
    },
  })

  res.json({ vendor: result.vendor })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const marketplaceService: MarketplaceModuleService =
    req.scope.resolve(MARKETPLACE_MODULE)

  const { id } = req.params

  await marketplaceService.deleteVendors(id)

  res.json({ id, object: "vendor", deleted: true })
}
