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
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.handle.trim()) newErrors.handle = "Slug is required";
    if (!formData.city.trim()) newErrors.city = "Origin city is required";

    if (!formData.admin.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.admin.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.admin.password) {
      newErrors.password = "Password is required";
    } else if (formData.admin.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }

    if (formData.admin.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.status === "disabled" && !formData.status_reason?.trim()) {
      newErrors.status_reason = "Reason is required when account is disabled";
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
            <div className="flex w-full max-w-[720px] flex-col gap-y-10">
              <div>
                <Heading className="text-ui-fg-base">Create Vendor</Heading>
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Add a new vendor store and credentials to the marketplace.
                </Text>
              </div>

              {/* SECTION 1: GENERAL */}
              <div className="flex flex-col gap-y-4">
                <Heading level="h2" className="border-b pb-2">
                  General
                </Heading>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="vendor-handle" size="small" weight="plus">
                      Slug <span className="text-ui-fg-error">*</span>
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
                        Auto-generated from name. Used as store URL handle.
                      </Text>
                    )}
                  </div>
                </div>

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
                </div>
              </div>

              {/* SECTION 2: ACCOUNT */}
              <div className="flex flex-col gap-y-4">
                <Heading level="h2" className="border-b pb-2">
                  Account
                </Heading>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="admin-email" size="small" weight="plus">
                      Email <span className="text-ui-fg-error">*</span>
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
                      Status
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
                        <Select.Item value="active">Active</Select.Item>
                        <Select.Item value="disabled">Disabled</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>

                {formData.status === "disabled" && (
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="status-reason" size="small" weight="plus">
                      Reason for Disabling{" "}
                      <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Textarea
                      id="status-reason"
                      placeholder="Enter description why account is disabled..."
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
                      Password <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Minimum 8 characters"
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
                      Confirm Password{" "}
                      <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm password"
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
                      First Name
                    </Label>
                    <Input
                      id="admin-first-name"
                      placeholder="e.g. John"
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
                      Last Name
                    </Label>
                    <Input
                      id="admin-last-name"
                      placeholder="e.g. Doe"
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
                  Store Information
                </Heading>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="store-name" size="small" weight="plus">
                      Store Name
                    </Label>
                    <Input
                      id="store-name"
                      placeholder="e.g. Acme Official Store"
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
                      Origin City
                    </Label>
                    <Input
                      id="store-city"
                      placeholder="e.g. Ashgabat"
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
                    Address
                  </Label>
                  <Input
                    id="store-address"
                    placeholder="e.g. 123 Main St, Suite 100"
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
                    Store Description
                  </Label>
                  <Textarea
                    id="store-description"
                    placeholder="Provide a brief description of the seller store..."
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
