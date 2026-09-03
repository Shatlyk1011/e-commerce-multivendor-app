import { validateAndTransformBody, type MiddlewareRoute } from '@medusajs/framework/http'
import { z } from '@medusajs/framework/zod'

export const CreateFavoriteSchema = z.object({
  product_id: z.string().min(1),
})

export type CreateFavoriteInput = z.infer<typeof CreateFavoriteSchema>

export const favoriteMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/store/favorites',
    method: 'POST',
    middlewares: [validateAndTransformBody(CreateFavoriteSchema)],
  },
]
