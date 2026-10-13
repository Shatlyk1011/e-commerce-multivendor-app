import { useState } from "react";
import {
  FocusModal,
  Button,
  Input,
  Label,
  Text,
  Heading,
  Select,
  Textarea,
} from "@medusajs/ui";
import { useCreateVendor } from "../../hooks/api/vendors";
import type { CreateVendorInput } from "../../types/vendor";

type CreateVendorFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initialState: CreateVendorInput = {
  name: "",
  handle: "",
  logo: "",
  status: "active",
  status_reason: "",
  store_name: "",
  store_description: "",
  address: "",
  city: "",
  admin: {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateVendorForm({
  open,
  onOpenChange,
}: CreateVendorFormProps) {
  const [formData, setFormData] = useState<CreateVendorInput>(initialState);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [handleManuallyEdited, setHandleManuallyEdited] = useState(false);

  const createVendor = useCreateVendor();

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      handle: handleManuallyEdited ? prev.handle : slugify(value),
    }));
    setErrors((e) => ({ ...e, name: "" }));
  };

  const handleHandleChange = (value: string) => {
    setHandleManuallyEdited(true);
    setFormData((prev) => ({ ...prev, handle: slugify(value) }));
    setErrors((e) => ({ ...e, handle: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Укажите название";
    if (!formData.handle.trim()) newErrors.handle = "Укажите идентификатор";
    if (!formData.city.trim()) newErrors.city = "Укажите город отправления";

    if (!formData.admin.email.trim()) {
      newErrors.email = "Укажите эл. почту";
    } else if (!/\S+@\S+\.\S+/.test(formData.admin.email)) {
      newErrors.email = "Неверный формат эл. почты";
    }

    if (!formData.admin.password) {
      newErrors.password = "Укажите пароль";
    } else if (formData.admin.password.length < 8) {
      newErrors.password = "Пароль должен содержать не менее 8 символов";
    }

    if (formData.admin.password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (formData.status === "disabled" && !formData.status_reason?.trim()) {
      newErrors.status_reason = "Укажите причину отключения аккаунта";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    createVendor.mutate(
      {
        name: formData.name.trim(),
        handle: formData.handle.trim(),
        logo: formData.logo?.trim() || undefined,
        status: formData.status,
        status_reason:
          formData.status === "disabled"
            ? formData.status_reason?.trim()
            : null,
        store_name: formData.store_name?.trim() || null,
        store_description: formData.store_description?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city.trim(),
        admin: {
          email: formData.admin.email.trim(),
          password: formData.admin.password,
          first_name: formData.admin.first_name?.trim() || undefined,
          last_name: formData.admin.last_name?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setFormData(initialState);
          setConfirmPassword("");
          setErrors({});
          setHandleManuallyEdited(false);
          onOpenChange(false);
        },
      },
    );
  };

  const handleClose = (isOpen: boolean) => {
    if (!createVendor.isPending) {
      setFormData(initialState);
      setConfirmPassword("");
      setErrors({});
      setHandleManuallyEdited(false);
      onOpenChange(isOpen);
    }
  };

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
                  Отмена
                </Button>
              </FocusModal.Close>
              <Button
                size="small"
                onClick={handleSubmit}
                isLoading={createVendor.isPending}
              >
                Создать продавца
              </Button>
            </div>
          </FocusModal.Header>

          <FocusModal.Body className="flex flex-1 flex-col items-center overflow-auto py-16">
            <div className="flex w-full max-w-[720px] flex-col gap-y-10">
              <div>
                <Heading className="text-ui-fg-base">Создать продавца</Heading>
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Добавьте магазин продавца и данные для входа в маркетплейс.
                </Text>
              </div>

              {/* SECTION 1: GENERAL */}
              <div className="flex flex-col gap-y-4">
                <Heading level="h2" className="border-b pb-2">
                  Основное
                </Heading>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="vendor-name" size="small" weight="plus">
                      Название <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="vendor-name"
                      placeholder="Например, Название компании"
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

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="vendor-handle" size="small" weight="plus">
                      Идентификатор <span className="text-ui-fg-error">*</span>
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
                        Создаётся из названия. Используется в URL магазина.
                      </Text>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="vendor-logo" size="small" weight="plus">
                    URL логотипа
                  </Label>
                  <Input
                    id="vendor-logo"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, logo: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* SECTION 2: ACCOUNT */}
              <div className="flex flex-col gap-y-4">
                <Heading level="h2" className="border-b pb-2">
                  Аккаунт
                </Heading>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="admin-email" size="small" weight="plus">
                      Эл. почта <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="seller@example.com"
                      value={formData.admin.email}
                      onChange={(e) => {
                        const emailVal = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          admin: { ...prev.admin, email: emailVal },
                        }));
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

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="vendor-status" size="small" weight="plus">
                      Статус
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          status: val as "active" | "disabled",
                        }));
                        setErrors((prev) => ({ ...prev, status_reason: "" }));
                      }}
                    >
                      <Select.Trigger id="vendor-status">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="active">Активен</Select.Item>
                        <Select.Item value="disabled">Отключён</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>

                {formData.status === "disabled" && (
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="status-reason" size="small" weight="plus">
                      Причина отключения{" "}
                      <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Textarea
                      id="status-reason"
                      placeholder="Укажите причину отключения аккаунта..."
                      value={formData.status_reason ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          status_reason: val,
                        }));
                        setErrors((prev) => ({ ...prev, status_reason: "" }));
                      }}
                      className={
                        errors.status_reason ? "border-ui-border-error" : ""
                      }
                    />
                    {errors.status_reason && (
                      <Text size="small" className="text-ui-fg-error">
                        {errors.status_reason}
                      </Text>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="admin-password" size="small" weight="plus">
                      Пароль <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Минимум 8 символов"
                      value={formData.admin.password}
                      onChange={(e) => {
                        const passVal = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          admin: { ...prev.admin, password: passVal },
                        }));
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      className={
                        errors.password ? "border-ui-border-error" : ""
                      }
                    />
                    {errors.password && (
                      <Text size="small" className="text-ui-fg-error">
                        {errors.password}
                      </Text>
                    )}
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <Label
                      htmlFor="confirm-password"
                      size="small"
                      weight="plus"
                    >
                      Подтвердите пароль{" "}
                      <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Подтвердите пароль"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }}
                      className={
                        errors.confirmPassword ? "border-ui-border-error" : ""
                      }
                    />
                    {errors.confirmPassword && (
                      <Text size="small" className="text-ui-fg-error">
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label
                      htmlFor="admin-first-name"
                      size="small"
                      weight="plus"
                    >
                      Имя
                    </Label>
                    <Input
                      id="admin-first-name"
                      placeholder="Например, Иван"
                      value={formData.admin.first_name}
                      onChange={(e) => {
                        const nameVal = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          admin: { ...prev.admin, first_name: nameVal },
                        }));
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="admin-last-name" size="small" weight="plus">
                      Фамилия
                    </Label>
                    <Input
                      id="admin-last-name"
                      placeholder="Например, Иванов"
                      value={formData.admin.last_name}
                      onChange={(e) => {
                        const nameVal = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          admin: { ...prev.admin, last_name: nameVal },
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: STORE INFORMATION */}
              <div className="flex flex-col gap-y-4">
                <Heading level="h2" className="border-b pb-2">
                  Информация о магазине
                </Heading>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="store-name" size="small" weight="plus">
                      Название магазина
                    </Label>
                    <Input
                      id="store-name"
                      placeholder="Например, Официальный магазин"
                      value={formData.store_name ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          store_name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="store-city" size="small" weight="plus">
                      Город отправления
                    </Label>
                    <Input
                      id="store-city"
                      placeholder="Например, Ашхабад"
                      value={formData.city ?? ""}
                      required
                      aria-invalid={!!errors.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                    />
                    {errors.city && (
                      <Text size="small" className="text-ui-fg-error">
                        {errors.city}
                      </Text>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="store-address" size="small" weight="plus">
                    Адрес
                  </Label>
                  <Input
                    id="store-address"
                    placeholder="Например, ул. Магтымгулы, 100"
                    value={formData.address ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="store-description" size="small" weight="plus">
                    Описание магазина
                  </Label>
                  <Textarea
                    id="store-description"
                    placeholder="Добавьте краткое описание магазина..."
                    value={formData.store_description ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        store_description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </FocusModal.Body>
        </div>
      </FocusModal.Content>
    </FocusModal>
  );
}
