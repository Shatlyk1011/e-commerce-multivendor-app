import { Modules, MedusaError } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  type CashPaymentStatus,
  type DeliveryMethod,
  type DeliveryOperationalStatus,
  type OrderOperationsMetadata,
} from "../../../lib/delivery";

type Input = {
  order_id: string;
  delivery_status: DeliveryOperationalStatus;
  cash_payment_status: CashPaymentStatus;
};

const updateOrderOperationsStep = createStep(
  "update-order-operations",
  async (
    { order_id, delivery_status, cash_payment_status }: Input,
    { container },
  ) => {
    const orderModuleService = container.resolve(Modules.ORDER);
    const order = await orderModuleService.retrieveOrder(order_id);
    const delivery = order.metadata?.delivery as
      | { method?: DeliveryMethod }
      | undefined;

    if (!delivery?.method) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "В заказе отсутствуют данные о доставке.",
      );
    }

    const methodStatuses =
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

    if (!methodStatuses.includes(delivery_status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Выбранный статус недоступен для этого способа доставки.",
      );
    }

    if (
      cash_payment_status === "collected" &&
      !["picked_up", "delivered"].includes(delivery_status)
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Оплату наличными можно подтвердить только после получения заказа.",
      );
    }

    const previousMetadata = order.metadata ?? {};
    const operations: OrderOperationsMetadata = {
      payment_method: "cash",
      cash_payment_status,
      delivery_status,
    };

    await orderModuleService.updateOrders(order_id, {
      metadata: {
        ...previousMetadata,
        ...operations,
      },
    });

    return new StepResponse(
      { order_id, operations },
      { order_id, previous_metadata: previousMetadata },
    );
  },
  async (data, { container }) => {
    if (!data) return;
    const orderModuleService = container.resolve(Modules.ORDER);
    await orderModuleService.updateOrders(data.order_id, {
      metadata: data.previous_metadata,
    });
  },
);

const updateOrderOperationsWorkflow = createWorkflow(
  "update-order-operations",
  function (input: Input) {
    const result = updateOrderOperationsStep(input);
    return new WorkflowResponse(result);
  },
);

export default updateOrderOperationsWorkflow;
