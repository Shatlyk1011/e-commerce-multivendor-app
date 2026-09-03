import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { CreateFavoriteInput } from './middlewares'

type FavoriteRecord = { id: string; product_id: string }

function favoriteRecords(metadata: Record<string, unknown> | null | undefined): FavoriteRecord[] {
  const value = metadata?.favorites
  if (!Array.isArray(value)) return []
  return value.filter((item): item is FavoriteRecord => {
    return Boolean(item && typeof item === 'object' && typeof (item as FavoriteRecord).id === 'string' && typeof (item as FavoriteRecord).product_id === 'string')
  })
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customerService = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(req.auth_context.actor_id)
  const records = favoriteRecords(customer.metadata)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = records.length
    ? await query.graph({
        entity: 'product',
        fields: ['id', 'title', 'handle', 'thumbnail', 'categories.*', 'variants.*'],
        filters: { id: records.map((record) => record.product_id) },
      })
    : { data: [] }
  const productsById = new Map(products.map((product) => [product.id, product]))
  return res.json({
    favorites: records
      .map((record) => ({ id: record.id, product: productsById.get(record.product_id) }))
      .filter((favorite): favorite is { id: string; product: (typeof products)[number] } => Boolean(favorite.product)),
  })
}

export async function POST(req: AuthenticatedMedusaRequest<CreateFavoriteInput>, res: MedusaResponse) {
  const customerService = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(req.auth_context.actor_id)
  const records = favoriteRecords(customer.metadata)
  const productId = req.validatedBody.product_id
  const existing = records.find((record) => record.product_id === productId)
  if (existing) return res.json({ favorite: existing })
  const favorite = { id: `fav_${productId}`, product_id: productId }
  await customerService.updateCustomers({ id: customer.id }, { metadata: { ...(customer.metadata ?? {}), favorites: [...records, favorite] } })
  return res.status(201).json({ favorite: { ...favorite, product: null } })
}
