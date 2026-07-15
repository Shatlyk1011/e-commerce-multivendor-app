import { 
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resetPasswordStep } from "./steps/reset-password"

export type AdminResetVendorPasswordWorkflowInput = {
  email: string
  password?: string
}

export const adminResetVendorPasswordWorkflow = createWorkflow(
  "admin-reset-vendor-password",
  function (input: AdminResetVendorPasswordWorkflowInput) {
    const resetResult = resetPasswordStep({
      email: input.email,
      password: input.password,
    })

    return new WorkflowResponse(resetResult)
  }
)

export default adminResetVendorPasswordWorkflow
