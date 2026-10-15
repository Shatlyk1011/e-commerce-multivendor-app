import type {
  MedusaContainer,
  OrderDTO,
  InferTypeOf,
  FilterableOrderProps,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";
import type {
  OrderStore,
  StoreReview as PublicStoreReview,
  OwnedStoreReview,
} from "@dtc/api-contracts";
import type StoreReview from "../modules/store-review/models/store-review";
import { STORE_REVIEW_MODULE } from "../modules/store-review";
import type StoreReviewModuleService from "../modules/store-review/service";

export type ReviewOrder = Pick<
  OrderDTO,
  "id" | "customer_id" | "status" | "metadata"
> & {
  items?: Array<{
    id: string;
    title: string;
    quantity?: number;
    thumbnail?: string | null;
    detail?: {
      quantity?: number;
    } | null;
  }> | null;
  vendor?: {
    id: string;
    name: string;
    store_name: string | null;
    logo: string | null;
  } | null;
};

const orderFields = [
  "id",
  "customer_id",
  "status",
  "metadata",
  "items.id",
  "items.title",
  "items.quantity",
  "items.detail.quantity",
  "items.thumbnail",
  "vendor.id",
  "vendor.name",
  "vendor.store_name",
  "vendor.logo",
];

export function checkoutOrderId(
  order: Pick<ReviewOrder, "id" | "metadata">,
): string {
  const parent = order.metadata?.parent_order_id;
  return typeof parent === "string" && parent ? parent : order.id;
}

export function isStoreOrderDelivered(
  order: Pick<ReviewOrder, "status" | "metadata">,
): boolean {
  return (
    order.status !== "canceled" &&
    ["delivered", "picked_up"].includes(String(order.metadata?.delivery_status))
  );
}

export function toPublicStoreReview(
  review: InferTypeOf<typeof StoreReview>,
): PublicStoreReview {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    author_name: review.author_name,
    verified_purchase: true,
    created_at: new Date(review.created_at).toISOString(),
    updated_at: new Date(review.updated_at).toISOString(),
  };
}

export function toOwnedStoreReview(
  review: InferTypeOf<typeof StoreReview>,
): OwnedStoreReview {
  return { ...toPublicStoreReview(review), status: review.status };
}

export async function getOwnedReviewOrder(
  container: MedusaContainer,
  orderId: string,
  customerId: string,
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "order",
    fields: orderFields,
    filters: { id: orderId, customer_id: customerId },
  });
  const order = data[0] as unknown as ReviewOrder | undefined;
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Заказ не найден.");
  }
  return order;
}

export async function getOrderStores(
  container: MedusaContainer,
  orderId: string,
  customerId: string,
): Promise<OrderStore[]> {
  const parent = await getOwnedReviewOrder(container, orderId, customerId);
  if (checkoutOrderId(parent) !== parent.id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Укажите основной заказ.",
    );
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  // Metadata is a JSON field on the order module, excluded from Graph's typed filters.
  // Resolve child IDs within that module before retrieving their vendor links.
  const orderService = container.resolve(Modules.ORDER);
  const filters: FilterableOrderProps & {
    metadata: { parent_order_id: string };
  } = {
    customer_id: customerId,
    metadata: { parent_order_id: parent.id },
  };
  const childIds = await orderService.listOrders(filters, {
    select: ["id"],
    take: null,
  });
  const { data } = childIds.length
    ? await query.graph({
        entity: "order",
        fields: orderFields,
        filters: {
          id: childIds.map((order) => order.id),
          customer_id: customerId,
        },
      })
    : { data: [] };
  const children = data as unknown as ReviewOrder[];
  const orders = children.length ? children : [parent];
  const service: StoreReviewModuleService =
    container.resolve(STORE_REVIEW_MODULE);
  const reviews = await service.listStoreReviews(
    { customer_id: customerId, checkout_order_id: parent.id },
    { take: null },
  );
  const byVendor = new Map(reviews.map((review) => [review.vendor_id, review]));

  return orders.flatMap((order): OrderStore[] => {
    if (!order.vendor) return [];
    const review = byVendor.get(order.vendor.id);
    return [
      {
        order_id: order.id,
        vendor: {
          id: order.vendor.id,
          name: order.vendor.store_name || order.vendor.name,
          logo: order.vendor.logo,
        },
        delivery_status:
          parent.status === "canceled" || order.status === "canceled"
            ? "cancelled"
            : typeof order.metadata?.delivery_status === "string"
              ? order.metadata.delivery_status
              : null,
        can_review:
          parent.status !== "canceled" &&
          isStoreOrderDelivered(order) &&
          Boolean(order.items?.length) &&
          !review,
        review: review ? toOwnedStoreReview(review) : null,
        items: (order.items ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          quantity: Number(item.quantity ?? item.detail?.quantity ?? 1),
          thumbnail: item.thumbnail ?? null,
        })),
      },
    ];
  });
}
