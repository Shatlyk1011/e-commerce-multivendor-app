import { Text } from "@medusajs/ui";

import {
  cashLabels,
  deliveryMethodLabels,
  getCashPaymentStatus,
  getDeliveryDetails,
  getDeliveryStatus,
  statusLabels,
} from "../lib/order-delivery";

type OrderCellProps = {
  row: { original: { metadata?: Record<string, unknown> | null } };
};

// These columns share the order details widget's metadata, labels, and defaults.
export const orderDeliveryColumns = [
  {
    id: "delivery_status",
    header: "Статус доставки",
    enableSorting: false,
    cell: ({ row }: OrderCellProps) => (
      <Text size="small" leading="compact" className="whitespace-nowrap">
        {statusLabels[getDeliveryStatus(row.original.metadata)]}
      </Text>
    ),
  },
  {
    id: "cash_payment_status",
    header: "Статус оплаты наличными",
    enableSorting: false,
    cell: ({ row }: OrderCellProps) => (
      <Text size="small" leading="compact" className="whitespace-nowrap">
        {cashLabels[getCashPaymentStatus(row.original.metadata)]}
      </Text>
    ),
  },
  {
    id: "delivery_method",
    header: "Способ доставки",
    enableSorting: false,
    cell: ({ row }: OrderCellProps) => {
      const delivery = getDeliveryDetails(row.original.metadata);

      return (
        <Text size="small" leading="compact" className="whitespace-nowrap">
          {delivery ? deliveryMethodLabels[delivery.method] : "—"}
        </Text>
      );
    },
  },
];
