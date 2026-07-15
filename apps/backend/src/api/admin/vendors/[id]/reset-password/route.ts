import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import adminResetVendorPasswordWorkflow from "../../../../../workflows/marketplace/admin-reset-vendor-password"

export const AdminResetVendorPasswordSchema = z.strictObject({
  email: z.string().email(),
  password: z.string().min(8),
})

type RequestBody = z.infer<typeof AdminResetVendorPasswordSchema>

export async function POST(
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) {
  await adminResetVendorPasswordWorkflow(req.scope).run({
    input: {
      email: req.validatedBody.email,
      password: req.validatedBody.password,
    },
  })

  res.json({ success: true })
}
