import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import type { StoreReviewInput } from "@dtc/api-contracts";
import {
  checkoutOrderId,
  getOwnedReviewOrder,
  isStoreOrderDelivered,
} from "../../lib/store-reviews";
import { STORE_REVIEW_MODULE } from "../../modules/store-review";
import type StoreReviewModuleService from "../../modules/store-review/service";

type Input = StoreReviewInput & { customer_id: string; order_id: string };

export const createStoreReviewStep = createStep(
  "create-store-review",
  async (input: Input, { container }) => {
    const order = await getOwnedReviewOrder(
      container,
      input.order_id,
      input.customer_id,
    );
    const checkoutId = checkoutOrderId(order);
    const parent =
      checkoutId === order.id
        ? order
        : await getOwnedReviewOrder(container, checkoutId, input.customer_id);
    if (
      !order.vendor ||
      !order.items?.length ||
      !isStoreOrderDelivered(order) ||
      parent.status === "canceled"
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Отзыв о магазине доступен после получения его товаров.",
      );
    }
    const service: StoreReviewModuleService =
      container.resolve(STORE_REVIEW_MODULE);
    const key = {
      customer_id: input.customer_id,
      vendor_id: order.vendor.id,
      checkout_order_id: checkoutId,
    };
    const [existing] = await service.listStoreReviews(key, { take: 1 });
    if (existing) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "Вы уже оставили отзыв об этом магазине в данном заказе.",
      );
    }
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["first_name", "last_name"],
      filters: { id: input.customer_id },
    });
    const customer = customers[0];
    const authorName =
      [customer?.first_name?.trim(), customer?.last_name?.trim().slice(0, 1)]
        .filter(Boolean)
        .join(" ") || "Покупатель";
    // The unique index is the final guard against simultaneous submissions.
    try {
      const review = await service.createStoreReviews({
        ...key,
        order_id: order.id,
        author_name: authorName,
        rating: input.rating,
        comment: input.comment,
      });
      return new StepResponse(review, review.id);
    } catch (error) {
      const [duplicate] = await service.listStoreReviews(key, { take: 1 });
      if (duplicate) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          "Вы уже оставили отзыв об этом магазине в данном заказе.",
        );
      }
      throw error;
    }
  },
  async (id, { container }) => {
    if (id) {
      const service: StoreReviewModuleService =
        container.resolve(STORE_REVIEW_MODULE);
      await service.deleteStoreReviews(id);
    }
  },
);

export default createWorkflow("create-store-review", function (input: Input) {
  return new WorkflowResponse(createStoreReviewStep(input));
});
