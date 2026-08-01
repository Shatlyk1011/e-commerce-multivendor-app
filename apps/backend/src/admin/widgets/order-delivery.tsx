import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Badge, Button, Container, Select, Text, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { sdk } from "../lib/client";

type DeliveryMethod = "pickup" | "courier";
type DeliveryStatus =
  | "awaiting_confirmation"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "picked_up"
  | "delivered"
  | "cancelled";
type CashPaymentStatus = "pending" | "collected" | "refunded" | "cancelled";
type VendorOrderOperationalStatus =
  | "new"
  | "courier_handoff"
  | "cancelled";

type DeliveryDetails = {
  method: DeliveryMethod;
  pickup_point?: {
    title?: string;
    address?: string;
    city?: string;
    hours?: string;
  };
  delivery_date?: string;
  time_slot?: string;
  recipient_phone?: string;
  customer_note?: string;
};

type OrderWidgetProps = {
  data: {
    id: string;
    metadata?: Record<string, unknown> | null;
  };
};

const vendorStatusLabels: Record<VendorOrderOperationalStatus, string> = {
  new: "Новый",
  courier_handoff: "Передан курьеру",
  cancelled: "Отменён продавцом",
};

type VendorOperationResponse = {
  operation: {
    status: VendorOrderOperationalStatus;
    cancellation_reason?: string | null;
    updated_at?: string;
  } | null;
};

const statusLabels: Record<DeliveryStatus, string> = {
  awaiting_confirmation: "Ожидает подтверждения",
  preparing: "Собирается",
  ready_for_pickup: "Готов к выдаче",
  out_for_delivery: "Передан курьеру",
  picked_up: "Получен",
  delivered: "Доставлен",
  cancelled: "Отменен",
};

const cashLabels: Record<CashPaymentStatus, string> = {
  pending: "Ожидает оплаты",
  collected: "Оплачено наличными",
  refunded: "Возврат наличных",
  cancelled: "Оплата отменена",
};

function getDeliveryDetails(
  metadata?: Record<string, unknown> | null,
): DeliveryDetails | null {
  const delivery = metadata?.delivery;
  if (!delivery || typeof delivery !== "object" || Array.isArray(delivery)) {
    return null;
  }

  const method = (delivery as { method?: unknown }).method;
  return method === "pickup" || method === "courier"
    ? (delivery as DeliveryDetails)
    : null;
}

function getDeliveryStatus(
  metadata: Record<string, unknown> | null | undefined,
): DeliveryStatus {
  const status = metadata?.delivery_status;
  return typeof status === "string" && status in statusLabels
    ? (status as DeliveryStatus)
    : "awaiting_confirmation";
}

function getCashPaymentStatus(
  metadata: Record<string, unknown> | null | undefined,
): CashPaymentStatus {
  const status = metadata?.cash_payment_status;
  return typeof status === "string" && status in cashLabels
    ? (status as CashPaymentStatus)
    : "pending";
}

const OrderDeliveryWidget = ({ data }: OrderWidgetProps) => {
  const queryClient = useQueryClient();
  const delivery = getDeliveryDetails(data.metadata);
  const { data: vendorOperationData } = useQuery({
    queryKey: ["vendor-order-operation", data.id],
    queryFn: () =>
      sdk.client.fetch<VendorOperationResponse>(
        `/admin/orders/${data.id}/vendor-operation`,
      ),
  });
  const vendorOperation = vendorOperationData?.operation;
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(() =>
    getDeliveryStatus(data.metadata),
  );
  const [cashPaymentStatus, setCashPaymentStatus] = useState<CashPaymentStatus>(
    () => getCashPaymentStatus(data.metadata),
  );

  const updateOperations = useMutation({
    mutationFn: (input: {
      delivery_status: DeliveryStatus;
      cash_payment_status: CashPaymentStatus;
    }) =>
      sdk.client.fetch(`/admin/orders/${data.id}/operations`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      toast.success("Статус заказа обновлен");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Не удалось обновить статус заказа"),
  });

  if (!delivery) return null;

  const statusOptions: DeliveryStatus[] =
    delivery.method === "pickup"
      ? [
        "awaiting_confirmation",
        "preparing",
        "ready_for_pickup",
        "picked_up",
        "cancelled",
      ]
      : [
        "awaiting_confirmation",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];

  return (
    <Container className="divide-y p-0">
      {vendorOperation && (
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            Статус продавца
          </Text>
          <Badge size="2xsmall" color={vendorOperation.status === "cancelled" ? "red" : "blue"}>
            {vendorStatusLabels[vendorOperation.status]}
          </Badge>
          {vendorOperation.cancellation_reason && (
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Причина отмены: {vendorOperation.cancellation_reason}
            </Text>
          )}
          {vendorOperation.updated_at && (
            <Text size="xsmall" leading="compact" className="text-ui-fg-muted">
              Обновлено: {new Date(vendorOperation.updated_at).toLocaleString("ru-RU")}
            </Text>
          )}
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Доставка и оплата
        </Text>
        <Badge
          size="small"
          className="mt-1 "
          color="blue"
        >
          {delivery.method === "pickup" ? "Самовывоз" : "Курьерская доставка"}
        </Badge>
      </div>

      <div className="flex flex-col gap-y-3 px-6 py-4">
        {delivery.method === "pickup" ? (
          <>
            <Text size="small" leading="compact" weight="plus">
              {delivery.pickup_point?.title}
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              {[
                delivery.pickup_point?.address,
                delivery.pickup_point?.city,
                delivery.pickup_point?.hours,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </>
        ) : (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {[delivery.delivery_date, delivery.time_slot]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        )}
        {delivery.recipient_phone && (
          <Text size="small" leading="compact">
            Получатель: {delivery.recipient_phone}
          </Text>
        )}
        {delivery.customer_note && (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Комментарий: {delivery.customer_note}
          </Text>
        )}

        <div className="flex flex-col gap-y-2 pt-2">
          <Text size="small" leading="compact" weight="plus">
            Статус доставки
          </Text>
          <Select
            value={deliveryStatus}
            onValueChange={(value) =>
              setDeliveryStatus(value as DeliveryStatus)
            }
          >
            <Select.Trigger>
              <Select.Value placeholder={statusLabels[deliveryStatus]} />
            </Select.Trigger>
            <Select.Content>
              {statusOptions.map((status) => (
                <Select.Item key={status} value={status}>
                  {statusLabels[status]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex flex-col gap-y-2">
          <Text size="small" leading="compact" weight="plus">
            Статус оплаты наличными
          </Text>
          <Select
            value={cashPaymentStatus}
            onValueChange={(value) =>
              setCashPaymentStatus(value as CashPaymentStatus)
            }
          >
            <Select.Trigger>
              <Select.Value placeholder={cashLabels[cashPaymentStatus]} />
            </Select.Trigger>
            <Select.Content>
              {(Object.keys(cashLabels) as CashPaymentStatus[]).map(
                (status) => (
                  <Select.Item key={status} value={status}>
                    {cashLabels[status]}
                  </Select.Item>
                ),
              )}
            </Select.Content>
          </Select>
        </div>

        <Button
          size="small"
          onClick={() =>
            updateOperations.mutate({
              delivery_status: deliveryStatus,
              cash_payment_status: cashPaymentStatus,
            })
          }
          disabled={updateOperations.isPending}
          isLoading={updateOperations.isPending}
        >
          Сохранить статус
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
});

export default OrderDeliveryWidget;
