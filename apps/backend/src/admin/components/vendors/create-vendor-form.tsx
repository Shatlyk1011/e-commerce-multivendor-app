import { useState } from "react"
import {
  FocusModal,
  Button,
  Input,
  Label,
  Text,
  Heading,
} from "@medusajs/ui"
import { useCreateVendor } from "../../hooks/api/vendors"
import type { CreateVendorInput } from "../../types/vendor"

type CreateVendorFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const initialState: CreateVendorInput = {
  name: "",
  handle: "",
  logo: "",
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CreateVendorForm({ open, onOpenChange }: CreateVendorFormProps) {
  const [formData, setFormData] = useState<CreateVendorInput>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateVendorInput, string>>>({})
  const [handleManuallyEdited, setHandleManuallyEdited] = useState(false)

  const createVendor = useCreateVendor()

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      // Auto-generate handle from name unless manually edited
      handle: handleManuallyEdited ? prev.handle : slugify(value),
    }))
    setErrors((e) => ({ ...e, name: undefined }))
  }

  const handleHandleChange = (value: string) => {
    setHandleManuallyEdited(true)
    setFormData((prev) => ({ ...prev, handle: slugify(value) }))
    setErrors((e) => ({ ...e, handle: undefined }))
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateVendorInput, string>> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.handle.trim()) newErrors.handle = "Handle is required"
    return newErrors
  }

  const handleSubmit = () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    createVendor.mutate(
      {
        name: formData.name.trim(),
        handle: formData.handle.trim(),
        ...(formData.logo?.trim() ? { logo: formData.logo.trim() } : {}),
      },
      {
        onSuccess: () => {
          setFormData(initialState)
          setErrors({})
          setHandleManuallyEdited(false)
          onOpenChange(false)
        },
      }
    )
  }

  const handleClose = (isOpen: boolean) => {
    if (!createVendor.isPending) {
      setFormData(initialState)
      setErrors({})
      setHandleManuallyEdited(false)
      onOpenChange(isOpen)
    }
  }

  return (
    <FocusModal open={open} onOpenChange={handleClose}>
      <FocusModal.Content>
        <div className="flex h-full flex-col overflow-hidden">
          <FocusModal.Header>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={createVendor.isPending}
                >
                  Cancel
                </Button>
              </FocusModal.Close>
              <Button
                size="small"
                onClick={handleSubmit}
                isLoading={createVendor.isPending}
              >
                Create Vendor
              </Button>
            </div>
          </FocusModal.Header>

          <FocusModal.Body className="flex flex-1 flex-col items-center overflow-auto py-16">
            <div className="flex w-full max-w-[720px] flex-col gap-y-8">
              <div>
                <Heading className="text-ui-fg-base">Create Vendor</Heading>
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Add a new vendor to the marketplace. All vendors will appear
                  in your storefront once approved.
                </Text>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="vendor-name" size="small" weight="plus">
                  Name <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="vendor-name"
                  placeholder="e.g. Acme Corporation"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={errors.name ? "border-ui-border-error" : ""}
                />
                {errors.name && (
                  <Text size="small" className="text-ui-fg-error">
                    {errors.name}
                  </Text>
                )}
              </div>

              {/* Handle */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="vendor-handle" size="small" weight="plus">
                  Handle <span className="text-ui-fg-error">*</span>
                </Label>
                <div className="bg-ui-bg-field border-ui-border-base flex items-center rounded-md border px-3">
                  <Text size="small" className="text-ui-fg-muted pr-2">
                    /
                  </Text>
                  <input
                    id="vendor-handle"
                    className="bg-transparent text-ui-fg-base placeholder-ui-fg-muted h-10 w-full text-sm outline-none"
                    placeholder="acme-corporation"
                    value={formData.handle}
                    onChange={(e) => handleHandleChange(e.target.value)}
                  />
                </div>
                {errors.handle ? (
                  <Text size="small" className="text-ui-fg-error">
                    {errors.handle}
                  </Text>
                ) : (
                  <Text size="small" className="text-ui-fg-subtle">
                    Auto-generated from name. Used as URL slug.
                  </Text>
                )}
              </div>

              {/* Logo URL */}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="vendor-logo" size="small" weight="plus">
                  Logo URL
                </Label>
                <Input
                  id="vendor-logo"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, logo: e.target.value }))
                  }
                />
                <Text size="small" className="text-ui-fg-subtle">
                  Optional. Provide a publicly accessible image URL.
                </Text>
              </div>
            </div>
          </FocusModal.Body>
        </div>
      </FocusModal.Content>
    </FocusModal>
  )
}
