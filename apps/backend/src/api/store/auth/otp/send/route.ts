import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { sendPhoneOtpWorkflow } from "../../../../../workflows/auth/send-phone-otp"
import type { SendOtpSchema } from "../middlewares"

export async function POST(
  req: MedusaRequest<SendOtpSchema>,
  res: MedusaResponse,
) {
  const { result } = await sendPhoneOtpWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(200).json(result)
}
