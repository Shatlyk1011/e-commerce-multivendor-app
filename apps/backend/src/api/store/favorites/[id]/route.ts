import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customerService = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(req.auth_context.actor_id)
  const records = Array.isArray(customer.metadata?.favorites) ? customer.metadata.favorites : []
  const favorites = records.filter((item) => Boolean(item && typeof item === 'object' && (item as { id?: string }).id !== req.params.id))
  await customerService.updateCustomers({ id: customer.id }, { metadata: { ...(customer.metadata ?? {}), favorites } })
  // The storefront SDK always parses successful responses as JSON. Returning
  // 204 makes the deletion succeed server-side but throws while parsing the
  // empty body, preventing React Query from invalidating the favorites query.
  return res.json({ id: req.params.id })
}
