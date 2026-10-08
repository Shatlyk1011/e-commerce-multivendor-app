'use client'

import type { StoreOrder } from '@medusajs/types'
import { Calendar, Clock, MapPin, MessageSquare, Package, Receipt, ShoppingBag, Truck, User } from 'lucide-react'

import { useI18n } from '@/components/providers/I18nProvider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPrice } from '@/features/cart/utils'
import { intlLocale } from '@/lib/i18n'

import { CashPaymentStatusBadge, DeliveryStatusBadge } from './order-status'

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

export function OrderDetailModal({ order, open, onOpenChange }: OrderDetailModalProps) {
  const { locale } = useI18n()
  if (!order) return null

  const items = order.items ?? []
  const shippingAddress = order.shipping_address
  const shippingMethods = order.shipping_methods ?? []
  const delivery = getDeliveryDetails(order)
  const totalItemCount = items.reduce((acc, item) => acc + (item.quantity ?? 1), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-apple-lg border-apple-hairline bg-apple-canvas flex max-h-[85vh] max-w-2xl min-w-[initial] flex-col gap-0 overflow-hidden p-0 shadow-xl sm:max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="border-apple-divider-soft bg-apple-canvas shrink-0 border-b p-5 pb-4 sm:p-6">
          <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-apple-ink font-heading text-xl font-semibold tracking-[-0.28px] sm:text-2xl">
                Заказ #{order.display_id || order.id.slice(-6)}
              </DialogTitle>
              <p className="text-apple-ink-muted-48 text-apple-caption flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                <Calendar className="text-apple-primary/80 h-3.5 w-3.5 shrink-0" />
                Оформлен{' '}
                {new Date(order.created_at).toLocaleDateString(intlLocale(locale), {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <DeliveryStatusBadge order={order} />
              <CashPaymentStatusBadge order={order} />
            </div>
          </div>
        </DialogHeader>

        {/* Body Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {/* Order Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-apple-ink flex items-center gap-2 text-sm font-semibold tracking-tight">
                <ShoppingBag className="text-apple-primary h-4 w-4" />
                Состав заказа
              </h3>
              <span className="text-apple-ink-muted-48 bg-apple-surface-pearl border-apple-hairline rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium">
                {totalItemCount} {totalItemCount === 1 ? 'товар' : totalItemCount < 5 ? 'товара' : 'товаров'}
              </span>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => {
                const itemTotal = (item.unit_price ?? 0) * (item.quantity ?? 1)
                return (
                  <div
                    key={item.id}
                    className="rounded-apple-md bg-apple-surface-pearl/80 border-apple-hairline hover:bg-apple-surface-pearl flex items-center gap-3.5 border p-3 transition-all sm:p-3.5"
                  >
                    <div className="border-apple-hairline h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white shadow-2xs sm:h-16 sm:w-16">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-apple-ink line-clamp-1 text-[13px] font-semibold tracking-tight sm:text-[14px]">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-apple-ink-muted-48 mt-0.5 line-clamp-1 text-[12px]">{item.subtitle}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-apple-ink-muted-80 bg-apple-canvas border-apple-hairline rounded border px-2 py-0.5 font-mono text-[11px] font-medium">
                          {item.quantity} шт. × {formatPrice(item.unit_price, order.currency_code, locale)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-apple-ink font-mono text-[14px] font-bold sm:text-[15px]">
                        {formatPrice(itemTotal, order.currency_code, locale)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Delivery & Address Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Delivery Address Card */}
            <div className="rounded-apple-lg bg-apple-canvas border-apple-hairline flex flex-col border p-4 shadow-2xs">
              <h4 className="text-apple-ink mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <MapPin className="text-apple-primary h-4 w-4" />
                Адрес доставки
              </h4>

              {delivery?.method === 'pickup' ? (
                <div className="text-apple-caption text-apple-ink-muted-80 space-y-1 text-xs sm:text-sm">
                  <span className="bg-apple-primary/10 text-apple-primary mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                    Пункт выдачи
                  </span>
                  <p className="text-apple-ink text-[13px] font-semibold sm:text-sm">
                    {delivery.pickup_point?.title || 'Пункт выдачи'}
                  </p>
                  {delivery.pickup_point?.address && <p className="leading-relaxed">{delivery.pickup_point.address}</p>}
                  {(delivery.pickup_point?.city || delivery.pickup_point?.hours) && (
                    <p className="text-apple-ink-muted-48 flex items-center gap-1 pt-1 text-[12px]">
                      <Clock className="h-3 w-3 shrink-0" />
                      {[delivery.pickup_point?.city, delivery.pickup_point?.hours].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              ) : shippingAddress ? (
                <div className="text-apple-caption text-apple-ink-muted-80 space-y-1 text-xs sm:text-sm">
                  <p className="text-apple-ink flex items-center gap-1.5 text-[13px] font-semibold sm:text-sm">
                    <User className="text-apple-ink-muted-48 h-3.5 w-3.5" />
                    {[shippingAddress.first_name, shippingAddress.last_name].filter(Boolean).join(' ') || 'Покупатель'}
                  </p>
                  <p className="leading-relaxed">
                    {[shippingAddress.city, shippingAddress.address_1, shippingAddress.address_2]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {shippingAddress.phone && (
                    <p className="text-apple-ink-muted-48 pt-1 font-mono text-[12px]">Тел: {shippingAddress.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-apple-caption text-apple-ink-muted-48 text-xs italic">Адрес не указан</p>
              )}
            </div>

            {/* Delivery Method Card */}
            <div className="rounded-apple-lg bg-apple-canvas border-apple-hairline flex flex-col border p-4 shadow-2xs">
              <h4 className="text-apple-ink mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <Truck className="text-apple-primary h-4 w-4" />
                Способ доставки
              </h4>

              <div className="text-apple-caption text-apple-ink-muted-80 flex-1 space-y-1.5 text-xs sm:text-sm">
                {delivery?.method === 'courier' && (delivery.delivery_date || delivery.time_slot) && (
                  <div className="bg-apple-surface-pearl border-apple-hairline mb-2 rounded-md border p-2">
                    <p className="text-apple-ink text-[12px] font-semibold">Курьерская доставка</p>
                    <p className="text-apple-ink-muted-80 mt-0.5 text-[11px]">
                      {[delivery.delivery_date, delivery.time_slot].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                )}

                {shippingMethods.length > 0 ? (
                  shippingMethods.map((sm, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-apple-ink text-[13px] font-medium">
                        {sm.name || 'Стандартная доставка'}
                      </span>
                      <span className="text-apple-ink-muted-80 font-mono text-[12px]">
                        {formatPrice(sm.amount, order.currency_code, locale)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-apple-ink text-[13px] font-medium">Курьерская доставка</p>
                )}
              </div>

              {delivery?.customer_note && (
                <div className="border-apple-hairline bg-apple-canvas-parchment/60 mt-3 flex items-start gap-2 rounded-lg border p-2.5">
                  <MessageSquare className="text-apple-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p className="text-apple-ink-muted-80 text-[12px] leading-tight">
                    <span className="text-apple-ink font-semibold">Комментарий:</span> {delivery.customer_note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="rounded-apple-lg bg-apple-canvas-parchment/70 border-apple-hairline space-y-2.5 border p-4 sm:p-5">
            <div className="border-apple-divider-soft flex items-center gap-1.5 border-b pb-1">
              <Receipt className="text-apple-primary h-4 w-4" />
              <span className="text-apple-ink text-xs font-semibold tracking-wider uppercase">Расчёт стоимости</span>
            </div>

            <div className="text-apple-caption text-apple-ink-muted-80 space-y-1.5 pt-1 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span>Стоимость товаров ({items.length}):</span>
                <span className="text-apple-ink font-mono font-medium">
                  {formatPrice(order.subtotal, order.currency_code, locale)}
                </span>
              </div>

              {Boolean(order.shipping_total) && (
                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span className="text-apple-ink font-mono font-medium">
                    {formatPrice(order.shipping_total, order.currency_code, locale)}
                  </span>
                </div>
              )}

              {Boolean(order.tax_total) && (
                <div className="flex justify-between">
                  <span>Налоги:</span>
                  <span className="text-apple-ink font-mono font-medium">
                    {formatPrice(order.tax_total, order.currency_code, locale)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-apple-divider-soft text-apple-ink mt-2 flex items-center justify-between border-t pt-3">
              <span className="text-sm font-bold tracking-tight sm:text-base">Итого к оплате:</span>
              <span className="text-apple-primary font-mono text-lg font-bold tracking-tight sm:text-xl">
                {formatPrice(order.total, order.currency_code, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-apple-divider-soft bg-apple-canvas-parchment rounded-b-apple-lg m-0 flex shrink-0 flex-row items-center justify-between border-t p-4 sm:justify-between sm:p-5">
          <div className="text-apple-ink-muted-48 hidden text-xs font-medium sm:block">
            Заказ #{order.display_id || order.id.slice(-6)}
          </div>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-apple-primary hover:bg-apple-primary-focus rounded-full px-6 py-2 text-sm font-semibold text-white shadow-2xs transition-all active:scale-[0.98]"
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
