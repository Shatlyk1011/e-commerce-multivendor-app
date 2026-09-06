import {
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";

export const StoreReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(1).max(2000),
  })
  .strict();
export const CreateStoreReviewSchema = StoreReviewSchema.extend({
  order_id: z.string().min(1),
});
export type CreateStoreReviewInput = z.infer<typeof CreateStoreReviewSchema>;
export type UpdateStoreReviewInput = z.infer<typeof StoreReviewSchema>;
export const StoreReviewsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export const storeReviewMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/orders/:id/stores",
    method: "GET",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    matcher: "/store/store-reviews",
    method: "POST",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      validateAndTransformBody(CreateStoreReviewSchema),
    ],
  },
  {
    matcher: "/store/store-reviews/:id",
    method: "POST",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      validateAndTransformBody(StoreReviewSchema),
    ],
  },
  {
    matcher: "/store/vendors/:id/reviews",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreReviewsQuerySchema, {})],
  },
];
