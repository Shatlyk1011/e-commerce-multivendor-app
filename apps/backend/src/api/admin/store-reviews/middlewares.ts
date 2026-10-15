import { validateAndTransformBody, validateAndTransformQuery, type MiddlewareRoute } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";

export const AdminStoreReviewsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const ModerateStoreReviewSchema = z.strictObject({
  status: z.enum(["approved", "rejected"]),
  expected_rating: z.number().int().min(1).max(5),
  expected_comment: z.string().min(1).max(2000),
});
export type ModerateStoreReviewInput = z.infer<typeof ModerateStoreReviewSchema>;

export const adminStoreReviewMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/store-reviews",
    method: "GET",
    middlewares: [validateAndTransformQuery(AdminStoreReviewsQuerySchema, {})],
  },
  {
    matcher: "/admin/store-reviews/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(ModerateStoreReviewSchema)],
  },
];
