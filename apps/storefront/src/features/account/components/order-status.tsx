import type { StoreOrder } from '@medusajs/types'

import { Badge } from '@/components/ui/badge'

type DeliveryStatus =
  | 'awaiting_confirmation'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'picked_up'
  | 'delivered'
  | 'cancelled'

type CashPaymentStatus = 'pending' | 'collected' | 'refunded' | 'cancelled'

const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  awaiting_confirmation: 'Ожидает подтверждения',
  preparing: 'Собирается',
  ready_for_pickup: 'Готов к выдаче',
  out_for_delivery: 'Передан курьеру',
  picked_up: 'Получен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
}

function getDeliveryStatus(order: StoreOrder): DeliveryStatus | null {
  const status = order.metadata?.delivery_status
  return typeof status === 'string' && status in deliveryStatusLabels ? (status as DeliveryStatus) : null
}

function getCashPaymentStatus(order: StoreOrder): CashPaymentStatus | null {
  const status = order.metadata?.cash_payment_status
  return status === 'pending' || status === 'collected' || status === 'refunded' || status === 'cancelled'
    ? status
    : null
}

export function isOrderDelivered(order: StoreOrder) {
  const deliveryStatus = getDeliveryStatus(order)
  return (
    deliveryStatus === 'picked_up' ||
    deliveryStatus === 'delivered' ||
    ['fulfilled', 'shipped', 'delivered'].includes(order.fulfillment_status ?? '')
  )
}

export function isOrderCancelled(order: StoreOrder) {
  return getDeliveryStatus(order) === 'cancelled' || order.status === 'canceled' || order.payment_status === 'canceled'
}

export function DeliveryStatusBadge({ order }: { order: StoreOrder }) {
  const deliveryStatus = getDeliveryStatus(order)

  if (deliveryStatus) {
    if (deliveryStatus === 'cancelled') {
      return <Badge className="border-rose-200 bg-rose-50 text-rose-700">{deliveryStatusLabels[deliveryStatus]}</Badge>
    }

    if (deliveryStatus === 'picked_up' || deliveryStatus === 'delivered') {
      return (
        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
          {deliveryStatusLabels[deliveryStatus]}
        </Badge>
      )
    }

    if (deliveryStatus === 'ready_for_pickup' || deliveryStatus === 'out_for_delivery') {
      return (
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">{deliveryStatusLabels[deliveryStatus]}</Badge>
      )
    }

    return <Badge className="border-blue-200 bg-blue-50 text-blue-700">{deliveryStatusLabels[deliveryStatus]}</Badge>
  }

  if (isOrderCancelled(order)) {
    return <Badge className="border-rose-200 bg-rose-50 text-rose-700">Отменен</Badge>
  }

  if (isOrderDelivered(order)) {
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Доставлен</Badge>
  }

  if (order.fulfillment_status === 'partially_fulfilled') {
    return <Badge className="border-amber-200 bg-amber-50 text-amber-700">В пути</Badge>
  }

  return <Badge className="border-blue-200 bg-blue-50 text-blue-700">В обработке</Badge>
}

export function CashPaymentStatusBadge({ order }: { order: StoreOrder }) {
  const cashStatus = getCashPaymentStatus(order)

  if (cashStatus === 'collected') {
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Оплачен наличными</Badge>
  }

  if (cashStatus === 'refunded' || cashStatus === 'cancelled') {
    return <Badge className="border-rose-200 bg-rose-50 text-rose-700">Оплата отменена</Badge>
  }

  if (cashStatus === 'pending') {
    return <Badge className="border-amber-200 bg-amber-50 text-amber-700">Оплата при получении</Badge>
  }

  if (order.payment_status === 'captured') {
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Оплачен</Badge>
  }

  return null
}
