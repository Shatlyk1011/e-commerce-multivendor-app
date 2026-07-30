'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import type { VendorOrder, VendorOrderResponse } from '@dtc/api-contracts'
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, MapPin, Package, Phone, Truck } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { medusa } from '@/lib/medusa'

function formatMoney(amount: number | undefined, currency: string) {
  return `${(amount ?? 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`
}

export default function VendorOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<VendorOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFulfilling, setIsFulfilling] = useState(false)

  useEffect(() => {
    let active = true

    medusa.client
      .fetch<VendorOrderResponse>(`/vendors/orders/${params.id}`)
      .then((response) => {
        if (active) setOrder(response.order)
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(error instanceof Error ? error.message : 'Не удалось загрузить заказ.')
          router.replace('/dashboard/orders')
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [params.id, router])

  const fulfillOrder = async () => {
    if (!order) return
    setIsFulfilling(true)
    try {
      await medusa.client.fetch(`/vendors/orders/${order.id}/fulfill`, { method: 'POST', body: {} })
      setOrder({ ...order, fulfillment_status: 'fulfilled' })
      toast.success('Заказ отмечен как переданный для выдачи/доставки.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось обработать заказ.')
    } finally {
      setIsFulfilling(false)
    }
  }

  if (isLoading || !order) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="text-apple-primary size-7 animate-spin" />
      </div>
    )
  }

  const delivery = order.delivery
  const isFulfilled = ['fulfilled', 'shipped'].includes(order.fulfillment_status ?? '')
  const address = order.shipping_address

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      <div className="mx-auto max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2">
          <Link href="/dashboard/orders">
            <ArrowLeft /> Все заказы
          </Link>
        </Button>

        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg border p-6">
          <div className="border-apple-divider-soft flex flex-wrap items-start justify-between gap-4 border-b pb-5">
            <div>
              <p className="text-apple-primary text-xs font-semibold tracking-[0.1em] uppercase">Заказ</p>
              <h1 className="text-apple-ink mt-1 text-2xl font-semibold">#{order.display_id || order.id.slice(-8)}</h1>
              <p className="text-apple-ink-muted-48 mt-1 text-sm">
                {new Date(order.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
            <Badge
              className={
                isFulfilled
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }
            >
              {isFulfilled ? 'Исполнен' : 'Новый заказ'}
            </Badge>
          </div>

          <div className="grid gap-5 py-6 md:grid-cols-2">
            <section className="rounded-apple-md border-apple-hairline border p-4">
              <h2 className="text-apple-ink flex items-center gap-2 text-sm font-semibold">
                <Truck className="text-apple-primary size-4" /> Доставка
              </h2>
              {delivery?.method === 'pickup' ? (
                <div className="text-apple-ink-muted-80 mt-3 space-y-1 text-sm">
                  <p className="text-apple-ink font-semibold">Самовывоз: {delivery.pickup_point?.title}</p>
                  <p>{delivery.pickup_point?.address}</p>
                  <p>
                    {delivery.pickup_point?.city} · {delivery.pickup_point?.hours}
                  </p>
                </div>
              ) : (
                <div className="text-apple-ink-muted-80 mt-3 space-y-1 text-sm">
                  <p className="text-apple-ink font-semibold">Курьерская доставка</p>
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> {delivery?.delivery_date} · {delivery?.time_slot}
                  </p>
                  <p>
                    {[address?.city, address?.address_1, address?.address_2].filter(Boolean).join(', ') ||
                      'Адрес не указан'}
                  </p>
                </div>
              )}
              {delivery?.customer_note && (
                <p className="text-apple-ink-muted-48 mt-3 border-t pt-3 text-xs">
                  Комментарий: {delivery.customer_note}
                </p>
              )}
            </section>

            <section className="rounded-apple-md border-apple-hairline border p-4">
              <h2 className="text-apple-ink flex items-center gap-2 text-sm font-semibold">
                <MapPin className="text-apple-primary size-4" /> Получатель
              </h2>
              <div className="text-apple-ink-muted-80 mt-3 space-y-1 text-sm">
                <p className="text-apple-ink font-semibold">
                  {[address?.first_name, address?.last_name].filter(Boolean).join(' ') || 'Покупатель'}
                </p>
                {order.email && <p>{order.email}</p>}
                {(delivery?.recipient_phone || address?.phone) && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5" /> {delivery?.recipient_phone || address?.phone}
                  </p>
                )}
              </div>
            </section>
          </div>

          <section>
            <h2 className="text-apple-ink mb-3 flex items-center gap-2 text-sm font-semibold">
              <Package className="text-apple-primary size-4" /> Товары
            </h2>
            <div className="divide-apple-divider-soft rounded-apple-md border-apple-hairline divide-y overflow-hidden border">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div>
                    <p className="text-apple-ink font-semibold">{item.variant?.product?.title || item.title}</p>
                    <p className="text-apple-ink-muted-48">{item.variant?.title}</p>
                  </div>
                  <div className="text-right">
                    <p>{item.quantity} шт.</p>
                    <p className="text-apple-ink font-semibold">
                      {formatMoney((item.unit_price ?? 0) * item.quantity, order.currency_code)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="border-apple-divider-soft mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
            <p className="text-apple-ink text-lg font-semibold">
              Товары: {formatMoney(order.subtotal ?? order.total, order.currency_code)}
            </p>
            <Button disabled={isFulfilled || isFulfilling} onClick={fulfillOrder}>
              {isFulfilling ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              {isFulfilled ? 'Исполнен' : delivery?.method === 'pickup' ? 'Готов к выдаче' : 'Передать курьеру'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
