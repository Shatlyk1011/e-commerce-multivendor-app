import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, MedusaError } from "@medusajs/framework/utils"

export type ResetPasswordStepInput = {
  email: string
  password?: string
}

export const resetPasswordStep = createStep(
  "reset-password",
  async (input: ResetPasswordStepInput, { container }) => {

    const authService = container.resolve(Modules.AUTH)

    if (!input.password) {
      return new StepResponse({ success: true }, null)
    }

    const response = await authService.updateProvider("emailpass", {
      entity_id: input.email,
      password: input.password,
    })

    if (!response.success) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        response.error || "Failed to reset password"
      )
    }

    return new StepResponse({ success: true }, null)
  }
)

export default resetPasswordStep
