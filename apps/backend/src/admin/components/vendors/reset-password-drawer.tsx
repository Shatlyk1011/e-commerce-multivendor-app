import { useEffect, useState } from "react";
import { Drawer, Button, Input, Label, Text, Heading } from "@medusajs/ui";
import { useResetVendorPassword } from "../../hooks/api/vendors";
import type { Vendor } from "../../types/vendor";

type ResetPasswordDrawerProps = {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResetPasswordDrawer({
  vendor,
  open,
  onOpenChange,
}: ResetPasswordDrawerProps) {
  const admin = vendor.admins?.[0];

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetPassword = useResetVendorPassword(vendor.id);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!password) {
      newErrors.password = "Укажите пароль";
    } else if (password.length < 8) {
      newErrors.password = "Пароль должен содержать не менее 8 символов";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!admin?.email) {
      newErrors.general = "Эл. почта продавца не найдена";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    resetPassword.mutate(
      {
        email: admin!.email,
        password,
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
          <Heading className="text-ui-fg-base">Сбросить пароль</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Укажите новый пароль для входа {admin?.email || "этого продавца"}.
          </Text>
        </Drawer.Header>

        <Drawer.Body className="flex flex-1 flex-col gap-y-6 overflow-y-auto p-6">
          {errors.general && (
            <div className="bg-ui-bg-error-subtle border-ui-border-error rounded-md border p-3">
              <Text size="small" className="text-ui-fg-error">
                {errors.general}
              </Text>
            </div>
          )}

          {/* New Password */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="new-password" size="small" weight="plus">
              Новый пароль <span className="text-ui-fg-error">*</span>
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={errors.password ? "border-ui-border-error" : ""}
            />
            {errors.password && (
              <Text size="small" className="text-ui-fg-error">
                {errors.password}
              </Text>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="confirm-new-password" size="small" weight="plus">
              Подтвердите новый пароль <span className="text-ui-fg-error">*</span>
            </Label>
            <Input
              id="confirm-new-password"
              type="password"
              placeholder="Подтвердите новый пароль"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              className={errors.confirmPassword ? "border-ui-border-error" : ""}
            />
            {errors.confirmPassword && (
              <Text size="small" className="text-ui-fg-error">
                {errors.confirmPassword}
              </Text>
            )}
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button
                size="small"
                variant="secondary"
                disabled={resetPassword.isPending}
              >
                Отмена
              </Button>
            </Drawer.Close>
            <Button
              size="small"
              onClick={handleSubmit}
              isLoading={resetPassword.isPending}
            >
              Сбросить пароль
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
export default ResetPasswordDrawer;
