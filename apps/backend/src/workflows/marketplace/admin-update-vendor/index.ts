import { 
  createWorkflow,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { updateVendorStep } from "./steps/update-vendor"
import { updateVendorAdminEmailStep } from "./steps/update-vendor-admin-email"

export type AdminUpdateVendorWorkflowInput = {
  id: string
  name?: string
  handle?: string
  logo?: string | null
  status?: "active" | "disabled"
  status_reason?: string | null
  store_name?: string | null
  store_description?: string | null
  address?: string | null
  city?: string | null
  admin?: {
    id: string
    email?: string
    oldEmail?: string
  }
}

export const adminUpdateVendorWorkflow = createWorkflow(
  "admin-update-vendor",
  function (input: AdminUpdateVendorWorkflowInput) {
    const updatedVendor = updateVendorStep({
      id: input.id,
      name: input.name,
      handle: input.handle,
      logo: input.logo,
      status: input.status,
      status_reason: input.status_reason,
      store_name: input.store_name,
      store_description: input.store_description,
      address: input.address,
      city: input.city,
    })

    const emailChangeData = transform({
      input,
    }, (data) => {
      if (
        data.input.admin && 
        data.input.admin.id && 
        data.input.admin.email && 
        data.input.admin.oldEmail && 
        data.input.admin.email.toLowerCase() !== data.input.admin.oldEmail.toLowerCase()
      ) {
        return {
          vendorAdminId: data.input.admin.id,
          oldEmail: data.input.admin.oldEmail,
          newEmail: data.input.admin.email,
        }
      }
      return null
    })

    // Use when() for conditional step execution in workflow composition
    when({ emailChangeData }, (data) => !!data.emailChangeData)
      .then(() => {
        // @ts-ignore
        updateVendorAdminEmailStep(emailChangeData)
      })

    // @ts-ignore
    const { data: vendorWithAdmin } = useQueryGraphStep({
      entity: "vendor",
      fields: [
        "id", 
        "name", 
        "handle", 
        "logo", 
        "status", 
        "status_reason", 
        "store_name", 
        "store_description", 
        "address", 
        "city", 
        "admins.*"
      ],
      filters: {
        id: input.id,
      },
    })

    return new WorkflowResponse({
      vendor: vendorWithAdmin[0],
    })
  }
)

export default adminUpdateVendorWorkflow
