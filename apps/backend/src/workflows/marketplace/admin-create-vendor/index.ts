import { 
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { 
  setAuthAppMetadataStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { createVendorStep } from "./steps/create-vendor"
import { createVendorAdminStep } from "./steps/create-vendor-admin"
import { createAuthIdentityStep } from "./steps/create-auth-identity"

export type AdminCreateVendorWorkflowInput = {
  name: string
  handle: string
  logo?: string
  status?: "active" | "disabled"
  status_reason?: string | null
  store_name?: string | null
  store_description?: string | null
  address?: string | null
  city: string
  admin: {
    email: string
    password?: string
    first_name?: string
    last_name?: string
  }
}

export const adminCreateVendorWorkflow = createWorkflow(
  "admin-create-vendor",
  function (input: AdminCreateVendorWorkflowInput) {
    const vendor = createVendorStep({
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

    const vendorAdminData = transform({
      input,
      vendor,
    }, (data) => {
      return {
        email: data.input.admin.email,
        first_name: data.input.admin.first_name,
        last_name: data.input.admin.last_name,
        vendor_id: data.vendor.id,
      }
    })

    const vendorAdmin = createVendorAdminStep(vendorAdminData)

    const authIdentityData = transform({
      input,
    }, (data) => {
      return {
        email: data.input.admin.email,
        password: data.input.admin.password,
      }
    })

    const authIdentity = createAuthIdentityStep(authIdentityData)

    setAuthAppMetadataStep({
      authIdentityId: authIdentity.id,
      actorType: "vendor",
      value: vendorAdmin.id,
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
        id: vendor.id,
      },
    })

    return new WorkflowResponse({
      vendor: vendorWithAdmin[0],
    })
  }
)

export default adminCreateVendorWorkflow
