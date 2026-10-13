import { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Input,
  Label,
  Text,
  Heading,
  Select,
  Textarea,
} from "@medusajs/ui";
import { useUpdateVendor } from "../../hooks/api/vendors";
import type { Vendor } from "../../types/vendor";

type AccountEditDrawerProps = {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AccountEditDrawer({
  vendor,
  open,
  onOpenChange,
}: AccountEditDrawerProps) {
  const admin = vendor.admins?.[0];

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"active" | "disabled">("active");
  const [statusReason, setStatusReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateVendor = useUpdateVendor(vendor.id);

  useEffect(() => {
    if (open) {
      setEmail(admin?.email ?? "");
      setStatus(vendor.status ?? "active");
      setStatusReason(vendor.status_reason ?? "");
      setErrors({});
    }
  }, [open, vendor, admin]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Укажите эл. почту";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Неверный формат эл. почты";
    }

    if (status === "disabled" && !statusReason.trim()) {
      newErrors.statusReason = "Укажите причину отключения";
    }

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
        status,
        status_reason: status === "disabled" ? statusReason.trim() : null,
        ...(admin
          ? {
              admin: {
                id: admin.id,
                email: email.trim(),
                oldEmail: admin.email,
              },
            }
          : {}),
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
          <Heading className="text-ui-fg-base">Редактировать настройки аккаунта</Heading>
        </Drawer.Header>

        <Drawer.Body className="flex flex-1 flex-col gap-y-6 overflow-y-auto p-6">
          {/* Email */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-admin-email" size="small" weight="plus">
              Эл. почта <span className="text-ui-fg-error">*</span>
            </Label>
            <Input
              id="edit-admin-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={errors.email ? "border-ui-border-error" : ""}
            />
            {errors.email && (
              <Text size="small" className="text-ui-fg-error">
                {errors.email}
              </Text>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="edit-vendor-status" size="small" weight="plus">
              Статус
            </Label>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val as "active" | "disabled");
                setErrors((prev) => ({ ...prev, statusReason: "" }));
              }}
            >
              <Select.Trigger id="edit-vendor-status">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="active">Активен</Select.Item>
                <Select.Item value="disabled">Отключён</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Status Reason */}
          {status === "disabled" && (
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="edit-status-reason" size="small" weight="plus">
                Причина отключения <span className="text-ui-fg-error">*</span>
              </Label>
              <Textarea
                id="edit-status-reason"
                placeholder="Укажите причину отключения аккаунта..."
                value={statusReason}
                onChange={(e) => {
                  setStatusReason(e.target.value);
                  setErrors((prev) => ({ ...prev, statusReason: "" }));
                }}
                className={errors.statusReason ? "border-ui-border-error" : ""}
              />
              {errors.statusReason && (
                <Text size="small" className="text-ui-fg-error">
                  {errors.statusReason}
                </Text>
              )}
            </div>
          )}
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
export default AccountEditDrawer;
