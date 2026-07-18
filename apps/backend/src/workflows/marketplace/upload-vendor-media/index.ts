import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  UploadedVendorMedia,
  uploadVendorMediaStep,
  VendorMediaFileInput,
} from "./steps/upload-vendor-media"

export type UploadVendorMediaWorkflowInput = {
  folder: string
  files: VendorMediaFileInput[]
}

const uploadVendorMediaWorkflow = createWorkflow(
  "upload-vendor-media",
  function (input: UploadVendorMediaWorkflowInput) {
    const files = uploadVendorMediaStep(input)

    return new WorkflowResponse<UploadedVendorMedia[]>(files)
  }
)

export default uploadVendorMediaWorkflow
