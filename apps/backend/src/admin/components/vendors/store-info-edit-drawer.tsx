import { useEffect, useState } from "react"
import { Drawer, Button, Input, Label, Heading, Text, Textarea } from "@medusajs/ui"
import { useUpdateVendor } from "../../hooks/api/vendors"
import type { Vendor, UpdateVendorInput } from "../../types/vendor"

type StoreInfoEditDrawerProps = {
  vendor: Vendor
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StoreInfoEditDrawer({
  vendor,
  open,
  onOpenChange,
}: StoreInfoEditDrawerProps) {
  const [formData, setFormData] = useState<UpdateVendorInput>({
    store_name: vendor.store_name ?? "",
    store_description: vendor.store_description ?? "",
    address: vendor.address ?? "",
    city: vendor.city ?? "",
  })

  const updateVendor = useUpdateVendor(vendor.id)
  const [cityError, setCityError] = useState("")

  useEffect(() => {
    if (open) {
      setFormData({
        store_name: vendor.store_name ?? "",
        store_description: vendor.store_description ?? "",
        address: vendor.address ?? "",
        city: vendor.city ?? "",
      })
      setCityError("")
    }
  }, [open, vendor])

  const handleSubmit = () => {
    const city = formData.city?.trim()
    if (!city) {
      setCityError("Origin city is required")
      return
    }

    updateVendor.mutate(
      {
        store_name: formData.store_name?.trim() || null,
        store_description: formData.store_description?.trim() || null,
        address: formData.address?.trim() || null,
        city,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading className="text-ui-fg-base">Edit Store Information</Heading>
        </Drawer.Header>

        <Drawer.Body className="flex flex-1 flex-col gap-y-6 overflow-y-auto p-6">
          {/* Store Name */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-store-name" size="small" weight="plus">
              Store Name
            </Label>
            <Input
              id="edit-store-name"
              placeholder="e.g. Acme Official Store"
              value={formData.store_name ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, store_name: e.target.value }))
              }
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-store-city" size="small" weight="plus">
              Origin City
            </Label>
            <Input
              id="edit-store-city"
              placeholder="e.g. Ashgabat"
              value={formData.city ?? ""}
              required
              aria-invalid={!!cityError}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
            />
            {cityError && <Text size="small" className="text-ui-fg-error">{cityError}</Text>}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-store-address" size="small" weight="plus">
              Address
            </Label>
            <Input
              id="edit-store-address"
              placeholder="e.g. 123 Main St, Suite 100"
              value={formData.address ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          {/* Store Description */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-store-description" size="small" weight="plus">
              Store Description
            </Label>
            <Textarea
              id="edit-store-description"
              placeholder="Provide a brief description of the seller store..."
              value={formData.store_description ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, store_description: e.target.value }))
              }
            />
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button
                size="small"
                variant="secondary"
                disabled={updateVendor.isPending}
              >
                Cancel
              </Button>
            </Drawer.Close>
            <Button
              size="small"
              onClick={handleSubmit}
              isLoading={updateVendor.isPending}
            >
              Save Changes
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
export default StoreInfoEditDrawer
