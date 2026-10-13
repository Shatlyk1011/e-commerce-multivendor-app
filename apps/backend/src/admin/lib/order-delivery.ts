export type DeliveryMethod = "pickup" | "courier";
export type DeliveryStatus =
  | "awaiting_confirmation"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "picked_up"
  | "delivered"
  | "cancelled";
export type CashPaymentStatus =
  | "pending"
  | "collected"
  | "refunded"
  | "cancelled";
export type DeliveryDetails = {
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

export const statusLabels: Record<DeliveryStatus, string> = {
  awaiting_confirmation: "Ожидает подтверждения",
  preparing: "Собирается",
  ready_for_pickup: "Готов к выдаче",
  out_for_delivery: "Передан курьеру",
  picked_up: "Получен",
  delivered: "Доставлен",
  cancelled: "Отменен",
};

export const cashLabels: Record<CashPaymentStatus, string> = {
  pending: "Ожидает оплаты",
  collected: "Оплачено наличными",
  refunded: "Возврат наличных",
  cancelled: "Оплата отменена",
};

export function getDeliveryDetails(
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

export function getDeliveryStatus(
  metadata: Record<string, unknown> | null | undefined,
): DeliveryStatus {
  const status = metadata?.delivery_status;
  return typeof status === "string" &&
    Object.prototype.hasOwnProperty.call(statusLabels, status)
    ? (status as DeliveryStatus)
    : "awaiting_confirmation";
}

export function getCashPaymentStatus(
  metadata: Record<string, unknown> | null | undefined,
): CashPaymentStatus {
  const status = metadata?.cash_payment_status;
  return typeof status === "string" &&
    Object.prototype.hasOwnProperty.call(cashLabels, status)
    ? (status as CashPaymentStatus)
    : "pending";
}

export const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  pickup: "Самовывоз",
  courier: "Курьерская доставка",
};
