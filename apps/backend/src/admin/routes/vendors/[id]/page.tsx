import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Button,
  Container,
  Heading,
  Text,
  Badge,
  IconButton,
  Prompt,
} from "@medusajs/ui"
import {
  ArrowLeft,
  PencilSquare,
  Trash,
  BuildingStorefront,
  Hashtag,
  Photo,
  User,
} from "@medusajs/icons"
import { useVendor, useDeleteVendor } from "../../../hooks/api/vendors"
import { EditVendorDrawer } from "../../../components/vendors/edit-vendor-drawer"

const VendorDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading, error } = useVendor(id!)
  const deleteVendor = useDeleteVendor()

  const vendor = data?.vendor

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="border-ui-border-strong h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-y-4 p-12">
        <Text className="text-ui-fg-subtle">Vendor not found.</Text>
        <Button variant="secondary" size="small" onClick={() => navigate("/vendors")}>
          Back to Vendors
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    deleteVendor.mutate(vendor.id, {
      onSuccess: () => {
        navigate("/vendors")
      },
    })
  }

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
                <Text size="small" className="text-ui-fg-subtle hover:text-ui-fg-base">
                  Vendors
                </Text>
              </Link>
              <Text size="small" className="text-ui-fg-muted">/</Text>
              <Text size="small" weight="plus">
                {vendor.name}
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setEditOpen(true)}
            >
              <PencilSquare />
              Edit
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash />
              Delete
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
                  ;(e.target as HTMLImageElement).style.display = "none"
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
                <Badge size="2xsmall" color="blue">
                  {(vendor.admins ?? []).length} admin
                  {(vendor.admins ?? []).length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </Container>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* General info */}
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Details</Heading>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-col gap-y-4">
                <div className="flex items-start gap-x-3">
                  <BuildingStorefront className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Name
                    </Text>
                    <Text size="small" leading="compact" className="text-ui-fg-subtle">
                      {vendor.name}
                    </Text>
                  </div>
                </div>

                <div className="flex items-start gap-x-3">
                  <Hashtag className="text-ui-fg-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="small" leading="compact" weight="plus">
                      Handle
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

          {/* Admins */}
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Admins</Heading>
              <Badge size="2xsmall">{(vendor.admins ?? []).length}</Badge>
            </div>

            <div className="px-6 py-4">
              {(vendor.admins ?? []).length === 0 ? (
                <Text size="small" className="text-ui-fg-subtle">
                  No admins assigned to this vendor yet.
                </Text>
              ) : (
                <div className="flex flex-col gap-y-3">
                  {vendor.admins!.map((admin) => (
                    <div
                      key={admin.id}
                      className="bg-ui-bg-component shadow-elevation-card-rest flex items-center gap-x-3 rounded-md px-4 py-3"
                    >
                      <div className="bg-ui-bg-base flex h-8 w-8 items-center justify-center rounded-full">
                        <User className="text-ui-fg-subtle h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <Text size="small" leading="compact" weight="plus">
                          {[admin.first_name, admin.last_name]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </Text>
                        <Text
                          size="small"
                          leading="compact"
                          className="text-ui-fg-subtle"
                        >
                          {admin.email}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </div>
      </div>

      {/* Edit Drawer */}
      <EditVendorDrawer
        vendor={vendor}
        open={editOpen}
        onOpenChange={setEditOpen}
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
            <Prompt.Cancel onClick={() => setDeleteOpen(false)}>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={handleDelete}>
              {deleteVendor.isPending ? "Deleting..." : "Delete Vendor"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </>
  )
}

export default VendorDetailPage
