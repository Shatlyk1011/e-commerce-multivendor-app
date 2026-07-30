import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Text } from "@medusajs/ui";

type DeliveryDetails = {
  method?: "pickup" | "courier";
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
    metadata?: Record<string, unknown> | null;
  };
};

function getDeliveryDetails(
  metadata?: Record<string, unknown> | null,
): DeliveryDetails | null {
  const delivery = metadata?.delivery;
  if (!delivery || typeof delivery !== "object" || Array.isArray(delivery))
    return null;

  const method = (delivery as DeliveryDetails).method;
  return method === "pickup" || method === "courier"
    ? (delivery as DeliveryDetails)
    : null;
}

const OrderDeliveryWidget = ({ data }: OrderWidgetProps) => {
  const delivery = getDeliveryDetails(data.metadata);

  if (!delivery) return null;

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          Delivery
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle mt-1">
          {delivery.method === "pickup" ? "Pickup point" : "Courier delivery"}
        </Text>
      </div>
      <div className="flex flex-col gap-y-2 px-6 py-4">
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
            Recipient: {delivery.recipient_phone}
          </Text>
        )}
        {delivery.customer_note && (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Note: {delivery.customer_note}
          </Text>
        )}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
});

export default OrderDeliveryWidget;
