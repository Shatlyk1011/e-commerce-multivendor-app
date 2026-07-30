import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  CartLineItemDTO,
  OrderDTO,
  LinkDefinition,
  InferTypeOf,
} from "@medusajs/framework/types";
import { Modules, promiseAll } from "@medusajs/framework/utils";
import {
  cancelOrderWorkflow,
  createOrderWorkflow,
} from "@medusajs/medusa/core-flows";
import MarketplaceModuleService from "../../../../modules/marketplace/service";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import Vendor from "../../../../modules/marketplace/models/vendor";
import type { DeliveryDetails } from "../../../../lib/delivery";

export type VendorOrder = OrderDTO & {
  vendor: InferTypeOf<typeof Vendor>;
};

type StepInput = {
  parentOrder: OrderDTO;
  vendorsItems: Record<string, CartLineItemDTO[]>;
  delivery: DeliveryDetails;
};

function prepareOrderData(
  items: CartLineItemDTO[],
  parentOrder: OrderDTO,
  delivery: DeliveryDetails,
) {
  return {
    items,
    metadata: {
      parent_order_id: parentOrder.id,
      delivery,
    },
    // use info from parent
    region_id: parentOrder.region_id,
    customer_id: parentOrder.customer_id,
    sales_channel_id: parentOrder.sales_channel_id,
    email: parentOrder.email,
    currency_code: parentOrder.currency_code,
    shipping_address_id: parentOrder.shipping_address?.id,
    billing_address_id: parentOrder.billing_address?.id,
  };
}

const createVendorOrdersStep = createStep(
  "create-vendor-orders",
  async (
    { vendorsItems, parentOrder, delivery }: StepInput,
    { container, context },
  ) => {
    const linkDefs: LinkDefinition[] = [];
    const createdOrders: VendorOrder[] = [];
    const vendorIds = Object.keys(vendorsItems);

    const marketplaceModuleService: MarketplaceModuleService =
      container.resolve(MARKETPLACE_MODULE);

    const vendors = await marketplaceModuleService.listVendors({
      id: vendorIds,
    });

    if (vendorIds.length === 1) {
      linkDefs.push({
        [MARKETPLACE_MODULE]: {
          vendor_id: vendors[0].id,
        },
        [Modules.ORDER]: {
          order_id: parentOrder.id,
        },
      });

      createdOrders.push({
        ...parentOrder,
        vendor: vendors[0],
      });

      return new StepResponse(
        {
          orders: createdOrders,
          linkDefs,
        },
        {
          created_orders: [],
        },
      );
    }

    try {
      await promiseAll(
        vendorIds.map(async (vendorId) => {
          const items = vendorsItems[vendorId];
          const vendor = vendors.find((v) => v.id === vendorId)!;

          const { result: childOrder } = (await createOrderWorkflow(
            container,
          ).run({
            input: prepareOrderData(items, parentOrder, delivery),
            context,
          })) as unknown as { result: VendorOrder };

          childOrder.vendor = vendor;
          createdOrders.push(childOrder);

          linkDefs.push({
            [MARKETPLACE_MODULE]: {
              vendor_id: vendor.id,
            },
            [Modules.ORDER]: {
              order_id: childOrder.id,
            },
          });
        }),
      );
    } catch (e) {
      return StepResponse.permanentFailure(
        `An error occurred while creating vendor orders: ${e}`,
        {
          created_orders: createdOrders,
        },
      );
    }
    return new StepResponse(
      {
        orders: createdOrders,
        linkDefs,
      },
      {
        created_orders: createdOrders,
      },
    );
  },
  async (data, { container, context }) => {
    if (!data) {
      return;
    }
    await promiseAll(
      data.created_orders.map((createdOrder) => {
        return cancelOrderWorkflow(container).run({
          input: {
            order_id: createdOrder.id,
          },
          context,
          container,
        });
      }),
    );
  },
);

export default createVendorOrdersStep;
