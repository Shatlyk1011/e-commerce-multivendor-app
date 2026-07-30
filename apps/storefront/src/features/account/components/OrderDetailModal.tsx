'use client'

import type { StoreOrder } from '@medusajs/types'
import { Calendar, CreditCard, MapPin, Package, Truck, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPrice } from '@/features/cart/utils'

interface OrderDetailModalProps {
  order: StoreOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type DeliveryDetails = {
  method: 'pickup' | 'courier'
  pickup_point?: { title?: string; address?: string; city?: string; hours?: string }
  delivery_date?: string
  time_slot?: string
  recipient_phone?: string
  customer_note?: string
}

function getDeliveryDetails(order: StoreOrder): DeliveryDetails | null {
  const delivery = order.metadata?.delivery
  if (!delivery || typeof delivery !== 'object' || Array.isArray(delivery)) return null
  const method = (delivery as { method?: unknown }).method
  return method === 'pickup' || method === 'courier' ? (delivery as DeliveryDetails) : null
}

function getFulfillmentStatusBadge(status?: string) {
  switch (status) {
    case 'fulfilled':
    case 'shipped':
    case 'delivered':
      return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Доставлен</Badge>
    case 'partially_fulfilled':
      return <Badge className="border-amber-200 bg-amber-50 text-amber-700">В пути</Badge>
    default:
      return <Badge className="border-blue-200 bg-blue-50 text-blue-700">В обработке</Badge>
  }
}

function getPaymentStatusBadge(status?: string) {
  switch (status) {
    case 'captured':
      return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Оплачен</Badge>
    case 'awaiting':
      return <Badge className="border-amber-200 bg-amber-50 text-amber-700">Ожидает оплаты</Badge>
    case 'canceled':
      return <Badge className="border-rose-200 bg-rose-50 text-rose-700">Отменен</Badge>
    default:
      return (
        <Badge variant="outline" className="text-apple-ink-muted-80 border-apple-hairline">
          Обработка
        </Badge>
      )
  }
}

export function OrderDetailModal({ order, open, onOpenChange }: OrderDetailModalProps) {
  if (!order) return null

  const items = order.items ?? []
  const shippingAddress = order.shipping_address
  const shippingMethods = order.shipping_methods ?? []
  const delivery = getDeliveryDetails(order)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-apple-lg border-apple-hairline bg-apple-canvas max-h-[90vh] max-w-2xl min-w-[initial] overflow-y-auto p-6">
        <DialogHeader className="border-apple-divider-soft flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle className="text-apple-ink text-xl font-semibold tracking-[-0.28px]">
              Заказ #{order.display_id || order.id.slice(-6)}
            </DialogTitle>
            <p className="text-apple-ink-muted-48 text-apple-caption mt-0.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> от {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="flex items-center gap-2 pr-6">
            {getFulfillmentStatusBadge(order.fulfillment_status)}
            {getPaymentStatusBadge(order.payment_status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Order Items List */}
          <div>
            <h3 className="text-apple-ink mb-3 flex items-center gap-2 text-sm font-semibold">
              <Package className="text-apple-primary h-4 w-4" /> Состав заказа ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-apple-sm bg-apple-surface-pearl border-apple-hairline flex items-center gap-3 border p-3"
                >
                  <div className="border-apple-hairline h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-neutral-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-apple-ink line-clamp-1 text-[13px] font-semibold">{item.title}</h4>
                    {item.subtitle && <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">{item.subtitle}</p>}
                    <p className="text-apple-ink-muted-80 mt-0.5 font-mono text-[12px]">
                      {item.quantity} шт. × {formatPrice(item.unit_price, order.currency_code)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-apple-ink text-[14px] font-bold">
                      {formatPrice((item.unit_price ?? 0) * (item.quantity ?? 1), order.currency_code)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Address Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-apple-sm bg-apple-canvas border-apple-hairline border p-4">
              <h4 className="text-apple-ink mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <MapPin className="text-apple-primary h-3.5 w-3.5" /> Адрес доставки
              </h4>
              {delivery?.method === 'pickup' ? (
                <div className="text-apple-caption text-apple-ink-muted-80 space-y-0.5">
                  <p className="text-apple-ink font-semibold">{delivery.pickup_point?.title || 'Пункт выдачи'}</p>
                  <p>{delivery.pickup_point?.address}</p>
                  <p>
                    {delivery.pickup_point?.city} · {delivery.pickup_point?.hours}
                  </p>
                </div>
              ) : shippingAddress ? (
                <div className="text-apple-caption text-apple-ink-muted-80 space-y-0.5">
                  <p className="text-apple-ink font-semibold">
                    {[shippingAddress.first_name, shippingAddress.last_name].filter(Boolean).join(' ') || 'Покупатель'}
                  </p>
                  <p>
                    {[shippingAddress.city, shippingAddress.address_1, shippingAddress.address_2]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {shippingAddress.phone && <p className="text-[12px]">Тел: {shippingAddress.phone}</p>}
                </div>
              ) : (
                <p className="text-apple-caption text-apple-ink-muted-48">Адрес не указан</p>
              )}
            </div>

            <div className="rounded-apple-sm bg-apple-canvas border-apple-hairline border p-4">
              <h4 className="text-apple-ink mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <Truck className="text-apple-primary h-3.5 w-3.5" /> Способ доставки
              </h4>
              {shippingMethods.length > 0 ? (
                <div className="text-apple-caption text-apple-ink-muted-80">
                  {delivery?.method === 'courier' && (
                    <p className="text-apple-ink mb-1 font-semibold">
                      Курьер: {delivery.delivery_date} · {delivery.time_slot}
                    </p>
                  )}
                  {shippingMethods.map((sm, idx) => (
                    <div key={idx}>
                      <p className="text-apple-ink font-semibold">{sm.name || 'Стандартная доставка'}</p>
                      <p className="mt-0.5 font-mono text-[12px]">{formatPrice(sm.amount, order.currency_code)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-apple-caption text-apple-ink-muted-80">Курьерская доставка</p>
              )}
              {delivery?.customer_note && (
                <p className="text-apple-ink-muted-48 mt-2 text-xs">Комментарий: {delivery.customer_note}</p>
              )}
            </div>
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="rounded-apple-sm bg-apple-surface-pearl border-apple-hairline space-y-2 border p-4">
            <div className="text-apple-caption text-apple-ink-muted-80 flex justify-between">
              <span>Стоимость товаров:</span>
              <span className="font-mono">{formatPrice(order.subtotal, order.currency_code)}</span>
            </div>
            {Boolean(order.shipping_total) && (
              <div className="text-apple-caption text-apple-ink-muted-80 flex justify-between">
                <span>Доставка:</span>
                <span className="font-mono">{formatPrice(order.shipping_total, order.currency_code)}</span>
              </div>
            )}
            {Boolean(order.tax_total) && (
              <div className="text-apple-caption text-apple-ink-muted-80 flex justify-between">
                <span>Налоги:</span>
                <span className="font-mono">{formatPrice(order.tax_total, order.currency_code)}</span>
              </div>
            )}
            <div className="border-apple-divider-soft text-apple-ink flex items-center justify-between border-t pt-2 text-base font-bold">
              <span>Итого:</span>
              <span className="text-apple-primary font-mono text-lg">
                {formatPrice(order.total, order.currency_code)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
