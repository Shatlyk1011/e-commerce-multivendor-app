import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { z } from "@medusajs/framework/zod";
import {
  CASH_PAYMENT_STATUSES,
  DELIVERY_OPERATIONAL_STATUSES,
} from "../../../../../lib/delivery";
import updateOrderOperationsWorkflow from "../../../../../workflows/marketplace/update-order-operations";

export const UpdateOrderOperationsSchema = z.strictObject({
  delivery_status: z.enum(DELIVERY_OPERATIONAL_STATUSES),
  cash_payment_status: z.enum(CASH_PAYMENT_STATUSES),
});

export type UpdateOrderOperationsSchema = z.infer<
  typeof UpdateOrderOperationsSchema
>;

export const POST = async (
  req: AuthenticatedMedusaRequest<UpdateOrderOperationsSchema>,
  res: MedusaResponse,
) => {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [existingOrder],
  } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: { id },
  });

  if (!existingOrder) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Заказ не найден.");
  }

  await updateOrderOperationsWorkflow(req.scope).run({
    input: {
      order_id: id,
      delivery_status: req.validatedBody.delivery_status,
      cash_payment_status: req.validatedBody.cash_payment_status,
    },
  });

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "status",
      "fulfillment_status",
      "payment_status",
      "metadata",
    ],
    filters: { id },
  });

  res.json({ order });
};
