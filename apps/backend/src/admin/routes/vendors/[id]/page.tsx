import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Button,
  Container,
  Heading,
  Text,
  Badge,
  IconButton,
  Prompt,
} from "@medusajs/ui";
import {
  ArrowLeft,
  PencilSquare,
  Trash,
  BuildingStorefront,
  Hashtag,
  Photo,
  User,
  Calendar,
  LockClosedSolid,
  ExclamationCircle,
} from "@medusajs/icons";
import { useVendor, useDeleteVendor } from "../../../hooks/api/vendors";
import { GeneralEditDrawer } from "../../../components/vendors/general-edit-drawer";
import { AccountEditDrawer } from "../../../components/vendors/account-edit-drawer";
import { StoreInfoEditDrawer } from "../../../components/vendors/store-info-edit-drawer";
import { ResetPasswordDrawer } from "../../../components/vendors/reset-password-drawer";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
    // timeStyle: "short",
  });
};

const VendorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Drawer states
  const [generalEditOpen, setGeneralEditOpen] = useState(false);
  const [accountEditOpen, setAccountEditOpen] = useState(false);
  const [storeInfoEditOpen, setStoreInfoEditOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, error } = useVendor(id!);
  const deleteVendor = useDeleteVendor();

  const vendor = data?.vendor;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="border-ui-border-strong h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-y-4 p-12">
        <Text className="text-ui-fg-subtle">Vendor not found.</Text>
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate("/vendors")}
        >
          Back to Vendors
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteVendor.mutate(vendor.id, {
      onSuccess: () => {
        navigate("/vendors");
      },
    });
  };

  const admin = vendor.admins?.[0];

  return (
    <>
      <div className="flex flex-col gap-y-6 p-6">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <IconButton
              size="small"
              variant="transparent"
              onClick={() => navigate("/vendors")}
            >
              <ArrowLeft />
            </IconButton>
            <div className="flex items-center gap-x-1">
              <Link to="/vendors">
                <Text
                  size="small"
                  className="text-ui-fg-subtle hover:text-ui-fg-base"
                >
                  Vendors
                </Text>
              </Link>
              <Text size="small" className="text-ui-fg-muted">
                /
              </Text>
              <Text size="small" weight="plus">
                {vendor.name}
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              size="small"
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash />
              Delete Vendor
            </Button>
          </div>
        </div>

        {/* Hero card */}
        <Container className="p-6">
          <div className="flex items-start gap-x-4">
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.name}
                className="h-16 w-16 rounded-xl object-cover shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="bg-ui-bg-component flex h-16 w-16 items-center justify-center rounded-xl shadow">
                <BuildingStorefront className="text-ui-fg-subtle h-8 w-8" />
              </div>
            )}
            <div className="flex flex-col gap-y-1">
              <Heading level="h1">{vendor.name}</Heading>
              <Text size="small" className="text-ui-fg-subtle font-mono">
                /{vendor.handle}
              </Text>
              <div className="mt-2 flex items-center gap-x-2">
                <Badge
                  size="2xsmall"
                  color={vendor.status === "active" ? "green" : "red"}
                >
                  {vendor.status === "active" ? "Active" : "Disabled"}
                </Badge>
                {vendor.store_name && (
                  <Badge size="2xsmall" color="blue">
                    {vendor.store_name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Container>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* SECTION 1: GENERAL */}
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">General</Heading>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setGeneralEditOpen(true)}
              >
                <PencilSquare />
                Edit
              </Button>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-col gap-y-4">
                <div className="flex items-start gap-x-3">
                  <BuildingStorefront className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Name
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {vendor.name}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <Hashtag className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Slug
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle font-mono"
                    >
                      /{vendor.handle}
                    </Text>
                  </div>
                </div>

                {vendor.logo && (
                  <div className="flex items-start gap-x-3">
                    <Photo className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex flex-col gap-y-0.5">
                      <Text size="small" leading="compact" weight="plus">
                        Logo URL
                      </Text>
                      <Text
                        size="small"
                        leading="compact"
                        className="text-ui-fg-subtle break-all"
                      >
                        {vendor.logo}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>

          {/* SECTION 2: ACCOUNT */}
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Account</Heading>
              <div className="flex items-center gap-x-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setResetPasswordOpen(true)}
                >
                  <LockClosedSolid />
                  Reset Password
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setAccountEditOpen(true)}
                >
                  <PencilSquare />
                  Edit
                </Button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-col gap-y-4">
                <div className="flex items-start gap-x-3">
                  <User className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Email
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {admin?.email || "—"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <ExclamationCircle className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Status
                    </Text>
                    <div>
                      <Badge
                        size="2xsmall"
                        color={vendor.status === "active" ? "green" : "red"}
                      >
                        {vendor.status === "active" ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {vendor.status === "disabled" && vendor.status_reason && (
                  <div className="flex items-start gap-x-3 bg-ui-bg-error-subtle rounded-md border p-3">
                    <ExclamationCircle className="text-ui-fg-error mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex flex-col gap-y-0.5">
                      <Text
                        size="small"
                        leading="compact"
                        weight="plus"
                        className="text-ui-fg-error"
                      >
                        Reason for Disabling
                      </Text>
                      <Text size="small" className="text-ui-fg-error-strong">
                        {vendor.status_reason}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-x-3">
                  <Calendar className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Last Login
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {admin?.last_login
                        ? formatDate(admin.last_login)
                        : "Never"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          {/* SECTION 3: STORE INFORMATION */}
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Store Information</Heading>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setStoreInfoEditOpen(true)}
              >
                <PencilSquare />
                Edit
              </Button>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-col gap-y-4">
                <div className="flex items-start gap-x-3">
                  <BuildingStorefront className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Store Name
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {vendor.store_name || "—"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <BuildingStorefront className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      City
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {vendor.city || "—"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <BuildingStorefront className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Address
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {vendor.address || "—"}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <BuildingStorefront className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Store Description
                    </Text>
                    <Text
                      size="small"
                      className="text-ui-fg-subtle whitespace-pre-wrap"
                    >
                      {vendor.store_description || "—"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          {/* SECTION 4: SYSTEM */}
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">System</Heading>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-col gap-y-4">
                <div className="flex items-start gap-x-3">
                  <Calendar className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Created At
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {formatDate(vendor.created_at)}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <Calendar className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Updated At
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-subtle"
                    >
                      {formatDate(vendor.updated_at)}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <div className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0 text-xs font-mono">
                    ID
                  </div>
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Vendor ID
                    </Text>
                    <Text
                      size="small"
                      leading="compact"
                      className="text-ui-fg-muted font-mono"
                    >
                      {vendor.id}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Edit Drawers */}
      <GeneralEditDrawer
        vendor={vendor}
        open={generalEditOpen}
        onOpenChange={setGeneralEditOpen}
      />

      <AccountEditDrawer
        vendor={vendor}
        open={accountEditOpen}
        onOpenChange={setAccountEditOpen}
      />

      <StoreInfoEditDrawer
        vendor={vendor}
        open={storeInfoEditOpen}
        onOpenChange={setStoreInfoEditOpen}
      />

      <ResetPasswordDrawer
        vendor={vendor}
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
      />

      {/* Delete Confirmation */}
      <Prompt open={deleteOpen} onOpenChange={setDeleteOpen} variant="danger">
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete "{vendor.name}"?</Prompt.Title>
            <Prompt.Description>
              This action cannot be undone. The vendor and all associated data
              will be permanently deleted.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel onClick={() => setDeleteOpen(false)}>
              Cancel
            </Prompt.Cancel>
            <Prompt.Action onClick={handleDelete}>
              {deleteVendor.isPending ? "Deleting..." : "Delete Vendor"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </>
  );
};

export default VendorDetailPage;
