import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Badge, Button, Container, Select, Text, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { sdk } from "../lib/client";

import {
  cashLabels,
  deliveryMethodLabels,
  getCashPaymentStatus,
  getDeliveryDetails,
  getDeliveryStatus,
  statusLabels,
  type CashPaymentStatus,
  type DeliveryStatus,
} from "../lib/order-delivery";

type VendorOrderOperationalStatus = "new" | "courier_handoff" | "cancelled";

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
    <Container className="order-first divide-y p-0">
      {vendorOperation && (
        <div className="flex flex-col gap-y-2 px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            Статус продавца
          </Text>
          <Badge
            size="2xsmall"
            color={vendorOperation.status === "cancelled" ? "red" : "blue"}
          >
            {vendorStatusLabels[vendorOperation.status]}
          </Badge>
          {vendorOperation.cancellation_reason && (
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Причина отмены: {vendorOperation.cancellation_reason}
            </Text>
          )}
          {vendorOperation.updated_at && (
            <Text size="xsmall" leading="compact" className="text-ui-fg-muted">
              Обновлено:{" "}
              {new Date(vendorOperation.updated_at).toLocaleString("ru-RU")}
            </Text>
          )}
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Доставка и оплата
        </Text>
        <Badge size="small" className="mt-1 " color="blue">
          {deliveryMethodLabels[delivery.method]}
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
  zone: "order.details.before",
});

export default OrderDeliveryWidget;
