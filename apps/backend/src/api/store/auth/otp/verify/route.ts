import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { otpService } from "../../../../../services/otp"
import { verifyPhoneOtpWorkflow } from "../../../../../workflows/auth/verify-phone-otp"
import type { VerifyOtpSchema } from "../middlewares"

function saveSession(req: MedusaRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}

export async function POST(
  req: MedusaRequest<VerifyOtpSchema>,
  res: MedusaResponse,
) {
  // Keep the provider behind the same service boundary used by the Medusa Auth
  // provider. This early check lets this temporary endpoint return the public
  // invalid-OTP contract without exposing workflow error serialization.
  if (!(await otpService.verify(req.validatedBody.phone, req.validatedBody.otp))) {
    res.status(401).json({
      success: false,
      message: "Invalid OTP",
    })
    return
  }

  try {
    const { result } = await verifyPhoneOtpWorkflow(req.scope).run({
      input: req.validatedBody,
    })

    const providerIdentity = result.authIdentity.provider_identities?.find(
      (identity) => identity.entity_id === req.validatedBody.phone,
    )

    // This is the same auth context stored by Medusa's native POST /auth/session
    // route, so all standard customer endpoints recognize the resulting session.
    req.session.auth_context = {
      actor_id: result.customer.id,
      actor_type: "customer",
      auth_identity_id: result.authIdentity.id,
      app_metadata: result.authIdentity.app_metadata ?? {},
      user_metadata: providerIdentity?.user_metadata ?? {},
    }

    await saveSession(req)

    res.status(200).json({
      success: true,
      customer: result.customer,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : ""

    if (
      ((error instanceof MedusaError &&
        error.type === MedusaError.Types.UNAUTHORIZED) ||
        errorMessage === "Invalid OTP")
    ) {
      res.status(401).json({
        success: false,
        message: errorMessage,
      })
      return
    }

    throw error
  }
}
