import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { otpService } from "../../../services/otp"

export const sendPhoneOtpStep = createStep(
  "send-phone-otp",
  async (phone: string) => {
    await otpService.send(phone)

    return new StepResponse({ success: true as const })
  },
)
