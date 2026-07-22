import type { AuthIdentityDTO, IAuthModuleService } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"

import { PHONE_OTP_PROVIDER } from "../../../providers/phone-otp/service"

type AuthenticatePhoneOtpStepInput = {
  phone: string
  otp: string
}

type AuthenticatePhoneOtpStepOutput = {
  authIdentity: AuthIdentityDTO
}

type AuthenticatePhoneOtpCompensation = {
  createdAuthIdentityId?: string
}

export const authenticatePhoneOtpStep = createStep<
  AuthenticatePhoneOtpStepInput,
  AuthenticatePhoneOtpStepOutput,
  AuthenticatePhoneOtpCompensation
>(
  "authenticate-phone-otp",
  async (
    input: AuthenticatePhoneOtpStepInput,
    { container },
  ): Promise<StepResponse<AuthenticatePhoneOtpStepOutput, AuthenticatePhoneOtpCompensation>> => {
    const authService: IAuthModuleService = container.resolve(Modules.AUTH)
    const existingIdentities = await authService.listAuthIdentities(
      {
        provider_identities: {
          entity_id: input.phone,
          provider: PHONE_OTP_PROVIDER,
        },
      },
      { take: 1 },
    )

    const response = await authService.authenticate(PHONE_OTP_PROVIDER, {
      body: input,
    })

    if (!response.success || !response.authIdentity) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        response.error || "Authentication failed",
      )
    }

    return new StepResponse(
      { authIdentity: response.authIdentity },
      {
        createdAuthIdentityId:
          existingIdentities.length === 0 ? response.authIdentity.id : undefined,
      },
    )
  },
  async (compensation, { container }) => {
    if (!compensation?.createdAuthIdentityId) {
      return
    }

    const authService: IAuthModuleService = container.resolve(Modules.AUTH)
    await authService.deleteAuthIdentities([compensation.createdAuthIdentityId])
  },
)
