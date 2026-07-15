import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Button,
  Container,
  Heading,
  Text,
  Badge,
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
  type DataTablePaginationState,
  Prompt,
} from "@medusajs/ui"
import {
  Trash,
  BuildingStorefront,
  Plus,
} from "@medusajs/icons"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useVendors, useDeleteVendor } from "../../hooks/api/vendors"
import { CreateVendorForm } from "../../components/vendors/create-vendor-form"
import type { Vendor } from "../../types/vendor"

// ─── Column helper ────────────────────────────────────────────────────────────

const colHelper = createDataTableColumnHelper<Vendor>()

const formatDate = (dateString?: string) => {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
    // timeStyle: "short",
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const VendorsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null)

  const offset = pagination.pageIndex * pagination.pageSize

  const { data, isLoading } = useVendors({
    q: search || undefined,
    limit: pagination.pageSize,
    offset,
  })

  const deleteVendor = useDeleteVendor()

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      colHelper.accessor("name", {
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-x-3">
            {row.original.logo ? (
              <img
                src={row.original.logo}
                alt={row.original.name}
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            ) : (
              <div className="bg-ui-bg-component flex h-8 w-8 items-center justify-center rounded-full">
                <BuildingStorefront className="text-ui-fg-subtle h-4 w-4" />
              </div>
            )}
            <Text size="small" leading="compact" weight="plus">
              {row.original.name}
            </Text>
          </div>
        ),
      }),
      colHelper.display({
        id: "email",
        header: "Email",
        cell: ({ row }) => {
          const admin = row.original.admins?.[0]
          return (
            <Text size="small" className="text-ui-fg-subtle">
              {admin?.email || "—"}
            </Text>
          )
        },
      }),
      colHelper.accessor("store_name", {
        header: "Store Name",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">
            {getValue() || "—"}
          </Text>
        ),
      }),
      colHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() ?? "active"
          return (
            <Badge size="2xsmall" color={status === "active" ? "green" : "red"}>
              {status === "active" ? "Active" : "Disabled"}
            </Badge>
          )
        },
      }),
      colHelper.display({
        id: "last_login",
        header: "Last Login",
        cell: ({ row }) => {
          const admin = row.original.admins?.[0]
          return (
            <Text size="small" className="text-ui-fg-subtle">
              {admin?.last_login ? formatDate(admin.last_login) : "Never"}
            </Text>
          )
        },
      }),
      colHelper.accessor("created_at", {
        header: "Created At",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">
            {formatDate(getValue())}
          </Text>
        ),
      }),
      colHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="transparent"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteTarget(row.original)
              }}
            >
              <Trash className="text-ui-fg-subtle" />
            </Button>
          </div>
        ),
      }),
    ],
    []
  )

  const table = useDataTable({
    data: data?.vendors ?? [],
    columns,
    getRowId: (vendor) => vendor.id,
    rowCount: data?.count ?? 0,
    isLoading,
    search: {
      state: search,
      onSearchChange: setSearch,
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick: (_e, row) => {
      navigate(`/vendors/${row.id}`)
    },
  })

  // ─── Delete confirm ────────────────────────────────────────────────────────

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteVendor.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
      },
    })
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col gap-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1">Vendors</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Manage marketplace vendors — create, update, and remove sellers.
            </Text>
          </div>
          <Button size="small" onClick={() => setCreateOpen(true)}>
            <Plus />
            Create Vendor
          </Button>
        </div>

        {/* Table */}
        <Container className="overflow-hidden p-0">
          <DataTable instance={table}>
            <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-x-2">
                <Heading level="h2">All Vendors</Heading>
                {data?.count !== undefined && (
                  <Badge size="2xsmall">{data.count}</Badge>
                )}
              </div>
              <DataTable.Search placeholder="Search vendors..." />
            </DataTable.Toolbar>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        </Container>
      </div>

      {/* Create FocusModal */}
      <CreateVendorForm open={createOpen} onOpenChange={setCreateOpen} />

      {/* Delete Confirmation Prompt */}
      <Prompt open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }} variant="danger">
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete "{deleteTarget?.name}"?</Prompt.Title>
            <Prompt.Description>
              This action cannot be undone. The vendor and all associated data
              will be permanently deleted.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel onClick={() => setDeleteTarget(null)}>Cancel</Prompt.Cancel>
            <Prompt.Action
              onClick={handleConfirmDelete}
            >
              {deleteVendor.isPending ? "Deleting..." : "Delete"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Vendors",
  icon: BuildingStorefront,
})

export default VendorsPage
