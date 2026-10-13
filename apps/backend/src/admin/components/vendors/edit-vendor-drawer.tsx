import { useEffect, useState } from "react";
import { Drawer, Button, Input, Label, Text, Heading } from "@medusajs/ui";
import { useUpdateVendor } from "../../hooks/api/vendors";
import type { Vendor, UpdateVendorInput } from "../../types/vendor";

type EditVendorDrawerProps = {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EditVendorDrawer({
  vendor,
  open,
  onOpenChange,
}: EditVendorDrawerProps) {
  const [formData, setFormData] = useState<UpdateVendorInput>({
    name: vendor.name,
    handle: vendor.handle,
    logo: vendor.logo ?? "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateVendorInput, string>>
  >({});

  const updateVendor = useUpdateVendor(vendor.id);

  // Sync form data when vendor prop changes (e.g. after re-open)
  useEffect(() => {
    if (open) {
      setFormData({
        name: vendor.name,
        handle: vendor.handle,
        logo: vendor.logo ?? "",
      });
      setErrors({});
    }
  }, [open, vendor]);

  const validate = () => {
    const newErrors: Partial<Record<keyof UpdateVendorInput, string>> = {};
    if (!formData.name?.trim()) newErrors.name = "Укажите название";
    if (!formData.handle?.trim()) newErrors.handle = "Укажите идентификатор";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    updateVendor.mutate(
      {
        name: formData.name?.trim(),
        handle: formData.handle?.trim(),
        logo: formData.logo?.trim() || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading className="text-ui-fg-base">Редактировать продавца</Heading>
        </Drawer.Header>

        <Drawer.Body className="flex flex-1 flex-col gap-y-6 overflow-y-auto p-6">
          {/* Name */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-vendor-name" size="small" weight="plus">
              Название <span className="text-ui-fg-error">*</span>
            </Label>
            <Input
              id="edit-vendor-name"
              value={formData.name ?? ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
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
            <Label htmlFor="edit-vendor-handle" size="small" weight="plus">
              Идентификатор <span className="text-ui-fg-error">*</span>
            </Label>
            <div className="bg-ui-bg-field border-ui-border-base flex items-center rounded-md border px-3">
              <Text size="small" className="text-ui-fg-muted pr-2">
                /
              </Text>
              <input
                id="edit-vendor-handle"
                className="bg-transparent text-ui-fg-base placeholder-ui-fg-muted h-10 w-full text-sm outline-none"
                value={formData.handle ?? ""}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    handle: slugify(e.target.value),
                  }));
                  setErrors((prev) => ({ ...prev, handle: undefined }));
                }}
              />
            </div>
            {errors.handle ? (
              <Text size="small" className="text-ui-fg-error">
                {errors.handle}
              </Text>
            ) : (
              <Text size="small" className="text-ui-fg-subtle">
                Идентификатор для URL этого продавца.
              </Text>
            )}
          </div>

          {/* Logo URL */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-vendor-logo" size="small" weight="plus">
              URL логотипа
            </Label>
            <Input
              id="edit-vendor-logo"
              placeholder="https://example.com/logo.png"
              value={formData.logo ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, logo: e.target.value }))
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
                Отмена
              </Button>
            </Drawer.Close>
            <Button
              size="small"
              onClick={handleSubmit}
              isLoading={updateVendor.isPending}
            >
              Сохранить изменения
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
