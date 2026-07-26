import { z } from "@medusajs/framework/zod"

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(800),
})

export type CreateReviewSchema = z.infer<typeof CreateReviewSchema>
