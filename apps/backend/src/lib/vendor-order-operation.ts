import { MedusaError } from "@medusajs/framework/utils";

export const VENDOR_ORDER_OPERATION_STATUSES = [
  "new",
  "courier_handoff",
  "cancelled",
] as const;

export type VendorOrderOperationStatus =
  (typeof VENDOR_ORDER_OPERATION_STATUSES)[number];

const transitions: Record<
  VendorOrderOperationStatus,
  VendorOrderOperationStatus[]
> = {
  new: ["courier_handoff", "cancelled"],
  courier_handoff: [],
  cancelled: [],
};

export function assertVendorOrderOperationTransition(
  current: VendorOrderOperationStatus,
  next: VendorOrderOperationStatus,
  reason?: string,
) {
  if (!transitions[current].includes(next)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "This vendor order status transition is not allowed.",
    );
  }

  if (next === "cancelled" && !reason?.trim()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A cancellation reason is required.",
    );
  }
}
