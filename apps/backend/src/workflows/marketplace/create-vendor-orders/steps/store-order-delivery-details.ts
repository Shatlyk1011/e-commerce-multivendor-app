import { Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type { DeliveryDetails } from "../../../../lib/delivery";

type Input = {
  order_id: string;
  delivery: DeliveryDetails;
};

const storeOrderDeliveryDetailsStep = createStep(
  "store-order-delivery-details",
  async ({ order_id, delivery }: Input, { container }) => {
    const orderModuleService = container.resolve(Modules.ORDER);
    const order = await orderModuleService.retrieveOrder(order_id);
    const previousMetadata = order.metadata ?? {};

    await orderModuleService.updateOrders(order_id, {
      metadata: {
        ...previousMetadata,
        delivery,
      },
    });

    return new StepResponse(undefined, {
      order_id,
      previous_metadata: previousMetadata,
    });
  },
  async (data, { container }) => {
    if (!data) return;

    const orderModuleService = container.resolve(Modules.ORDER);
    await orderModuleService.updateOrders(data.order_id, {
      metadata: data.previous_metadata,
    });
  },
);

export default storeOrderDeliveryDetailsStep;
