import { useMemo, useState } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Badge, Container, DataTable, Heading, Select, Text, createDataTableColumnHelper, useDataTable, type DataTablePaginationState } from "@medusajs/ui";
import { useSellerRequests, useUpdateSellerRequest } from "../../hooks/api/seller-requests";
import type { SellerRequest, SellerRequestStatus } from "../../types/seller-request";

const helper = createDataTableColumnHelper<SellerRequest>();
const labels: Record<SellerRequestStatus, string> = { new: "New", in_review: "In review", approved: "Approved", rejected: "Rejected" };
const SellerRequestsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({ pageIndex: 0, pageSize: 20 });
  const { data, isLoading } = useSellerRequests({ limit: pagination.pageSize, offset: pagination.pageIndex * pagination.pageSize });
  const update = useUpdateSellerRequest();
  const columns = useMemo(() => [
    helper.accessor("name", { header: "Name", cell: ({ getValue }) => <Text size="small" weight="plus">{getValue()}</Text> }),
    helper.accessor("brand_name", { header: "Brand", cell: ({ getValue }) => <Text size="small">{getValue()}</Text> }),
    helper.accessor("business_type", { header: "Business type", cell: ({ getValue }) => <Text size="small">{getValue()}</Text> }),
    helper.accessor("phone", { header: "Phone" }),
    helper.accessor("address", { header: "Address" }),
    helper.accessor("status", { header: "Status", cell: ({ row }) => <Select value={row.original.status} onValueChange={(status) => update.mutate({ id: row.original.id, status: status as SellerRequestStatus })}><Select.Trigger className="w-32"><Select.Value /></Select.Trigger><Select.Content>{Object.entries(labels).map(([value, label]) => <Select.Item key={value} value={value}>{label}</Select.Item>)}</Select.Content></Select> }),
    helper.accessor("created_at", { header: "Submitted", cell: ({ getValue }) => <Text size="small" className="text-ui-fg-subtle">{new Date(getValue()).toLocaleDateString()}</Text> }),
  ], [update]);
  const table = useDataTable({ data: data?.seller_requests ?? [], columns, getRowId: (row) => row.id, rowCount: data?.count ?? 0, isLoading, pagination: { state: pagination, onPaginationChange: setPagination } });
  return <div className="flex flex-col gap-y-4 p-6"><div><Heading level="h1">Seller requests</Heading><Text size="small" className="mt-1 text-ui-fg-subtle">Review incoming seller applications and update their status.</Text></div><Container className="overflow-hidden p-0"><DataTable instance={table}><DataTable.Toolbar className="px-6 py-4"><div className="flex items-center gap-x-2"><Heading level="h2">All requests</Heading><Badge size="2xsmall">{data?.count ?? 0}</Badge></div></DataTable.Toolbar><DataTable.Table /><DataTable.Pagination /></DataTable></Container></div>;
};
export const config = defineRouteConfig({ label: "Seller requests" });
export default SellerRequestsPage;
