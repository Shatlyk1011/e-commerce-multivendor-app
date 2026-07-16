import { useState, useMemo } from "react"
import {
  Container,
  Heading,
  Text,
  Badge,
  DataTable,
  useDataTable,
  createDataTableColumnHelper,
  type DataTablePaginationState,
  Button,
  Prompt,
  toast,
} from "@medusajs/ui"
import {
  Folder,
  Trash,
} from "@medusajs/icons"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/client"

interface ProductCategory {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
  created_at: string
}

interface ProductCategoryListResponse {
  product_categories: ProductCategory[]
  count: number
}

const colHelper = createDataTableColumnHelper<ProductCategory>()

const CategoriesPage = () => {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null)

  const offset = pagination.pageIndex * pagination.pageSize
  const queryClient = useQueryClient()

  // Query categories
  const { data, isLoading } = useQuery<ProductCategoryListResponse>({
    queryKey: ["admin_product_categories", search, pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      sdk.client.fetch<ProductCategoryListResponse>("/admin/product-categories", {
        query: {
          q: search || undefined,
          limit: pagination.pageSize,
          offset,
          fields: "id,name,handle,parent_category_id,created_at",
        },
      }),
  })

  // Mutation for cascade delete
  const deleteCategory = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/product-categories/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin_product_categories"] })
      toast.success(`Successfully deleted category and ${res.deleted_count - 1} subcategories.`)
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete category.")
    }
  })

  const columns = useMemo(
    () => [
      colHelper.accessor("name", {
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-x-3">
            <div className="bg-ui-bg-component flex h-8 w-8 items-center justify-center rounded-full">
              <Folder className="text-ui-fg-subtle h-4 w-4" />
            </div>
            <Text size="small" leading="compact" weight="plus">
              {row.original.name}
            </Text>
          </div>
        ),
      }),
      colHelper.accessor("handle", {
        header: "Handle",
        cell: ({ getValue }) => (
          <code className="text-xs bg-ui-bg-subtle px-1.5 py-0.5 rounded text-ui-fg-subtle font-mono">
            {getValue()}
          </code>
        ),
      }),
      colHelper.accessor("parent_category_id", {
        header: "Parent ID",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle font-mono text-xs">
            {getValue() || "—"}
          </Text>
        ),
      }),
      colHelper.accessor("created_at", {
        header: "Created At",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">
            {getValue() ? new Date(getValue()).toLocaleDateString() : "—"}
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
    data: data?.product_categories ?? [],
    columns,
    getRowId: (cat) => cat.id,
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
  })

  return (
    <>
      <div className="flex flex-col gap-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1">Product Categories</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Browse, search, and recursively delete category taxonomy.
            </Text>
          </div>
        </div>

        {/* Table */}
        <Container className="overflow-hidden p-0">
          <DataTable instance={table}>
            <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-x-2">
                <Heading level="h2">All Categories</Heading>
                {data?.count !== undefined && (
                  <Badge size="2xsmall">{data.count}</Badge>
                )}
              </div>
              <DataTable.Search placeholder="Search categories..." />
            </DataTable.Toolbar>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        </Container>
      </div>

      {/* Delete Prompt */}
      <Prompt open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }} variant="danger">
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete category "{deleteTarget?.name}"?</Prompt.Title>
            <Prompt.Description>
              This action cannot be undone. This category and all of its nested child subcategories
              will be permanently deleted.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel onClick={() => setDeleteTarget(null)}>Cancel</Prompt.Cancel>
            <Prompt.Action
              onClick={() => deleteCategory.mutate(deleteTarget!.id)}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? "Deleting..." : "Delete category + children"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Categories",
  icon: Folder,
})

export default CategoriesPage
