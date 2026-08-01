import { medusa } from '@/lib/medusa'

export type DeliveryMethod = 'pickup' | 'courier'

export type PickupPoint = {
  id: string
  title: string
  area: string
  address: string
  city: string
  hours: string
}

export type DeliveryConfiguration = {
  methods: Array<{
    id: DeliveryMethod
    title: string
    description: string
    shipping_option_code: string
  }>
  pickup_points: PickupPoint[]
}

export type CompleteVendorOrderInput = {
  delivery_method: DeliveryMethod
  payment_method: 'cash'
  pickup_point_id?: string
  delivery_date?: string
  time_slot?: string
  recipient_phone?: string
  customer_note?: string
}

export type CompleteVendorOrderResponse = {
  type: 'order'
  order: { id: string; display_id?: number }
}

export function getDeliveryConfiguration() {
  return medusa.client.fetch<DeliveryConfiguration>('/store/delivery')
}

export function completeVendorOrder(cartId: string, body: CompleteVendorOrderInput) {
  return medusa.client.fetch<CompleteVendorOrderResponse>(`/store/carts/${cartId}/complete-vendor`, {
    method: 'POST',
    body,
  })
}
