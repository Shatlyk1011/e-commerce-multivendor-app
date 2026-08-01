import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { VENDOR_ORDER_OPERATION_STATUSES } from "../../../../../lib/vendor-order-operation";
import updateVendorOrderOperationWorkflow from "../../../../../workflows/marketplace/update-vendor-order-operation";

export const UpdateVendorOrderOperationSchema = z.strictObject({
  status: z.enum(VENDOR_ORDER_OPERATION_STATUSES),
  reason: z.string().trim().min(3).max(500).optional(),
});

export type UpdateVendorOrderOperationSchema = z.infer<
  typeof UpdateVendorOrderOperationSchema
>;

export const POST = async (
  req: AuthenticatedMedusaRequest<UpdateVendorOrderOperationSchema>,
  res: MedusaResponse,
) => {
  const { result: operation } = await updateVendorOrderOperationWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      vendor_admin_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  });

  res.json({
    operation: {
      status: operation.status,
      reason: operation.cancellation_reason ?? undefined,
      updated_at:
        operation.updated_at instanceof Date
          ? operation.updated_at.toISOString()
          : operation.updated_at,
      updated_by_vendor_admin_id: operation.updated_by_vendor_admin_id,
    },
  });
};
