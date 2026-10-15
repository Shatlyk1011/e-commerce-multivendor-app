import { useMemo, useState } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Badge,
  Button,
  Container,
  DataTable,
  Heading,
  Select,
  Text,
  createDataTableColumnHelper,
  useDataTable,
  type DataTablePaginationState,
} from "@medusajs/ui";
import { useModerateStoreReview, useStoreReviews } from "../../hooks/api/store-reviews";
import type { AdminStoreReview, StoreReviewStatus } from "../../types/store-review";

const column = createDataTableColumnHelper<AdminStoreReview>();
const labels: Record<StoreReviewStatus, string> = {
  pending: "На проверке",
  approved: "Опубликован",
  rejected: "Отклонён",
};

const StoreReviewsPage = () => {
  const [status, setStatus] = useState<StoreReviewStatus | "all">("pending");
  const [pagination, setPagination] = useState<DataTablePaginationState>({ pageIndex: 0, pageSize: 20 });
  const { data, isLoading, isError, refetch } = useStoreReviews({
    status,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });
  const moderate = useModerateStoreReview();
  const columns = useMemo(
    () => [
      column.accessor("vendor_name", {
        header: "Магазин",
        cell: ({ getValue }) => <Text size="small" weight="plus">{getValue()}</Text>,
      }),
      column.accessor("author_name", {
        header: "Покупатель",
        cell: ({ getValue }) => <Text size="small">{getValue()}</Text>,
      }),
      column.accessor("rating", {
        header: "Оценка",
        cell: ({ getValue }) => <Text size="small">{getValue()} / 5</Text>,
      }),
      column.accessor("comment", {
        header: "Отзыв",
        cell: ({ getValue }) => (
          <Text size="small" className="max-w-md whitespace-pre-wrap break-words">{getValue()}</Text>
        ),
      }),
      column.accessor("status", {
        header: "Статус",
        cell: ({ getValue }) => (
          <Badge size="2xsmall" color={getValue() === "approved" ? "green" : getValue() === "rejected" ? "red" : "orange"}>
            {labels[getValue()]}
          </Badge>
        ),
      }),
      column.accessor("created_at", {
        header: "Отправлен",
        cell: ({ getValue }) => <Text size="small" className="text-ui-fg-subtle">{new Date(getValue()).toLocaleString("ru-RU")}</Text>,
      }),
      column.display({
        id: "actions",
        header: "Решение",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.status !== "approved" && (
              <Button size="small" disabled={moderate.isPending} onClick={() => moderate.mutate({ id: row.original.id, status: "approved", expected_rating: row.original.rating, expected_comment: row.original.comment })}>
                Одобрить
              </Button>
            )}
            {row.original.status !== "rejected" && (
              <Button size="small" variant="secondary" disabled={moderate.isPending} onClick={() => moderate.mutate({ id: row.original.id, status: "rejected", expected_rating: row.original.rating, expected_comment: row.original.comment })}>
                Отклонить
              </Button>
            )}
          </div>
        ),
      }),
    ],
    [moderate.isPending, moderate.mutate],
  );
  const table = useDataTable({
    data: data?.reviews ?? [],
    columns,
    getRowId: (review) => review.id,
    rowCount: data?.count ?? 0,
    isLoading,
    pagination: { state: pagination, onPaginationChange: setPagination },
  });

  return (
    <div className="flex flex-col gap-y-4 p-6">
      <div>
        <Heading level="h1">Отзывы о магазинах</Heading>
        <Text size="small" className="mt-1 text-ui-fg-subtle">Проверяйте отзывы покупателей перед публикацией.</Text>
      </div>
      <Container className="overflow-hidden p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex items-center justify-between gap-3 px-6 py-4">
            <div className="flex items-center gap-2">
              <Text size="small" weight="plus">Отзывы</Text>
              <Badge size="2xsmall">{data?.count ?? 0}</Badge>
            </div>
            <Select value={status} onValueChange={(value) => {
              setStatus(value as StoreReviewStatus | "all");
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}>
              <Select.Trigger className="w-44"><Select.Value /></Select.Trigger>
              <Select.Content>
                <Select.Item value="pending">На проверке</Select.Item>
                <Select.Item value="approved">Опубликованные</Select.Item>
                <Select.Item value="rejected">Отклонённые</Select.Item>
                <Select.Item value="all">Все отзывы</Select.Item>
              </Select.Content>
            </Select>
          </DataTable.Toolbar>
          {isError ? (
            <div className="flex items-center gap-3 px-6 py-4">
              <Text size="small">Не удалось загрузить отзывы.</Text>
              <Button size="small" variant="secondary" onClick={() => refetch()}>Повторить</Button>
            </div>
          ) : (
            <><DataTable.Table /><DataTable.Pagination /></>
          )}
        </DataTable>
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({ label: "Отзывы о магазинах" });
export default StoreReviewsPage;
