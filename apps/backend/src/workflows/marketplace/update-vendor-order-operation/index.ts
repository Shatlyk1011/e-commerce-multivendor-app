import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  assertVendorOrderOperationTransition,
  type VendorOrderOperationStatus,
} from "../../../lib/vendor-order-operation";
import { MARKETPLACE_MODULE } from "../../../modules/marketplace";
import MarketplaceModuleService from "../../../modules/marketplace/service";

type Input = {
  order_id: string;
  vendor_admin_id: string;
  status: VendorOrderOperationStatus;
  reason?: string;
};

const updateVendorOrderOperationStep = createStep(
  "update-vendor-order-operation",
  async (input: Input, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const {
      data: [vendorAdmin],
    } = await query.graph({
      entity: "vendor_admin",
      fields: ["vendor.orders.id"],
      filters: { id: [input.vendor_admin_id] },
    });
    const isOwner = vendorAdmin?.vendor?.orders?.some(
      (order) => order?.id === input.order_id,
    );
    if (!isOwner) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You cannot update this order.",
      );
    }

    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);
    const [existingOperation] =
      await marketplaceModuleService.listVendorOrderOperations({
        order_id: input.order_id,
      });
    const current = existingOperation?.status ?? "new";

    assertVendorOrderOperationTransition(current, input.status, input.reason);

    const operationData = {
      status: input.status,
      cancellation_reason:
        input.status === "cancelled" ? input.reason?.trim() : null,
      updated_by_vendor_admin_id: input.vendor_admin_id,
    };

    const operation = existingOperation
      ? await marketplaceModuleService.updateVendorOrderOperations({
          id: existingOperation.id,
          ...operationData,
        })
      : await marketplaceModuleService.createVendorOrderOperations({
          order_id: input.order_id,
          vendor_id: vendorAdmin.vendor!.id,
          ...operationData,
        });

    return new StepResponse(operation, {
      created: !existingOperation,
      operation: existingOperation
        ? {
            id: existingOperation.id,
            status: existingOperation.status,
            cancellation_reason: existingOperation.cancellation_reason,
            updated_by_vendor_admin_id:
              existingOperation.updated_by_vendor_admin_id,
          }
        : { id: operation.id },
    });
  },
  async (data, { container }) => {
    if (!data) return;
    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);
    if (data.created) {
      await marketplaceModuleService.deleteVendorOrderOperations(
        data.operation.id,
      );
      return;
    }
    await marketplaceModuleService.updateVendorOrderOperations(data.operation);
  },
);

const updateVendorOrderOperationWorkflow = createWorkflow(
  "update-vendor-order-operation",
  function (input: Input) {
    const operation = updateVendorOrderOperationStep(input);
    return new WorkflowResponse(operation);
  },
);

export default updateVendorOrderOperationWorkflow;
