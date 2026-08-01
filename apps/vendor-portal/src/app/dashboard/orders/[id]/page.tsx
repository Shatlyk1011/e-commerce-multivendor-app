'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import type { VendorOrder, VendorOrderOperationalStatus, VendorOrderResponse } from '@dtc/api-contracts'
import { AlertCircle, ArrowLeft, ExternalLink, Loader2, Package, ZoomIn } from 'lucide-react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { medusa } from '@/lib/medusa'

function formatMoney(amount: number | undefined, currency: string) {
  return `${(amount ?? 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`
}

function getStatusBadgeStyle(status: VendorOrderOperationalStatus) {
  switch (status) {
    case 'courier_handoff':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'cancelled':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'new':
    default:
      return 'border-sky-200 bg-sky-50 text-sky-700'
  }
}

const statusLabels: Record<VendorOrderOperationalStatus, string> = {
  new: 'Новый',
  courier_handoff: 'Передан курьеру',
  cancelled: 'Отменён продавцом',
}

export default function VendorOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<VendorOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Cancellation alert modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')

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

  const updateVendorStatus = async (status: VendorOrderOperationalStatus, reason?: string) => {
    if (!order) return
    setIsUpdatingStatus(true)
    try {
      const response = await medusa.client.fetch<{ operation: NonNullable<VendorOrder['vendor_operation']> }>(
        `/vendors/orders/${order.id}/operation`,
        {
          method: 'POST',
          body: { status, ...(status === 'cancelled' && reason ? { reason: reason.trim() } : {}) },
        },
      )
      let fulfillmentStatus = order.fulfillment_status
      if (status === 'courier_handoff') {
        await medusa.client.fetch(`/vendors/orders/${order.id}/fulfill`, { method: 'POST', body: {} })
        fulfillmentStatus = 'fulfilled'
      }
      setOrder({ ...order, fulfillment_status: fulfillmentStatus, vendor_operation: response.operation })
      toast.success('Статус заказа успешно обновлен.')
      if (status === 'cancelled') {
        setIsCancelModalOpen(false)
        setCancellationReason('')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить статус заказа.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleConfirmCancel = () => {
    if (cancellationReason.trim().length < 3) {
      toast.error('Укажите причину отмены (минимум 3 символа).')
      return
    }
    updateVendorStatus('cancelled', cancellationReason)
  }

  if (isLoading || !order) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="text-apple-primary size-7 animate-spin" />
      </div>
    )
  }

  const vendorStatus: VendorOrderOperationalStatus = order.vendor_operation?.status ?? 'new'

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2">
          <Link href="/dashboard/orders">
            <ArrowLeft className="size-4" /> Все заказы
          </Link>
        </Button>

        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg border p-6 shadow-sm">
          {/* Order Header: Display ID, Timestamp & Status Badge */}
          <div className="border-apple-divider-soft flex flex-wrap items-start justify-between gap-4 border-b pb-5">
            <div>
              <p className="text-apple-primary text-xs font-semibold tracking-[0.1em] uppercase">Заказ</p>
              <h1 className="text-apple-ink mt-1 text-2xl font-semibold">#{order.display_id || order.id.slice(-8)}</h1>
              <p className="text-apple-ink-muted-48 mt-1 text-sm">
                {new Date(order.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
            <Badge className={getStatusBadgeStyle(vendorStatus)}>{statusLabels[vendorStatus]}</Badge>
          </div>

          {/* Order Goods Section */}
          <section className="py-6">
            <h2 className="text-apple-ink mb-3 flex items-center gap-2 text-sm font-semibold">
              <Package className="text-apple-primary size-4" /> Товары заказа
            </h2>
            <div className="divide-apple-divider-soft rounded-apple-md border-apple-hairline divide-y overflow-hidden border">
              {order.items?.map((item) => {
                const imageUrl = item.thumbnail || item.variant?.product?.thumbnail
                const productId = item.product_id || item.variant?.product_id || item.variant?.product?.id
                const title = item.variant?.product?.title || item.title || 'Товар'

                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-3 text-sm">
                    <div className="flex items-center gap-3.5">
                      {imageUrl ? (
                        <Zoom>
                          <div className="group rounded-apple-sm border-apple-hairline bg-apple-canvas-parchment relative size-16 shrink-0 cursor-zoom-in overflow-hidden border">
                            <img
                              src={imageUrl}
                              alt={title}
                              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute right-1 bottom-1 rounded-full bg-black/60 p-1 text-white shadow-xs backdrop-blur-xs transition-transform duration-150 group-hover:scale-110">
                              <ZoomIn className="size-3" />
                            </div>
                          </div>
                        </Zoom>
                      ) : (
                        <div className="border-apple-hairline bg-apple-canvas-parchment text-apple-ink-muted-48 rounded-apple-sm flex size-14 shrink-0 items-center justify-center border">
                          <Package className="size-6" />
                        </div>
                      )}
                      <div>
                        {productId ? (
                          <Link
                            href={`/dashboard/products/${productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-apple-ink hover:text-apple-primary group/title inline-flex items-center gap-1.5 font-semibold transition-colors hover:underline"
                          >
                            <span>{title}</span>
                            <ExternalLink className="text-apple-ink-muted-48 group-hover/title:text-apple-primary size-3.5 opacity-70 transition-opacity group-hover/title:opacity-100" />
                          </Link>
                        ) : (
                          <p className="text-apple-ink font-semibold">{title}</p>
                        )}
                        {item.variant?.title && item.variant.title !== 'Default Variant' && (
                          <p className="text-apple-ink-muted-48 text-xs">{item.variant.title}</p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-apple-ink-muted-80">{item.quantity} шт.</p>
                      <p className="text-apple-ink font-semibold">
                        {formatMoney((item.unit_price ?? 0) * item.quantity, order.currency_code)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Cancellation Reason Notice (if cancelled) */}
          {vendorStatus === 'cancelled' && order.vendor_operation?.reason && (
            <div className="rounded-apple-md mb-6 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-semibold">Причина отмены:</p>
              <p className="mt-1">{order.vendor_operation.reason}</p>
            </div>
          )}

          {/* Status Change Controls (for new orders) */}
          {vendorStatus === 'new' && (
            <div className="border-apple-divider-soft mb-6 flex flex-wrap gap-3 border-t pt-5">
              <Button disabled={isUpdatingStatus} onClick={() => updateVendorStatus('courier_handoff')}>
                {isUpdatingStatus && <Loader2 className="mr-2 size-4 animate-spin" />}
                Передать курьеру
              </Button>
              <Button
                variant="outline"
                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                disabled={isUpdatingStatus}
                onClick={() => setIsCancelModalOpen(true)}
              >
                Отменить заказ
              </Button>
            </div>
          )}

          {/* Total Price Section */}
          <div className="border-apple-divider-soft flex items-center justify-between gap-4 border-t pt-5">
            <p className="text-apple-ink-muted-48 text-sm font-medium">Итоговая сумма:</p>
            <p className="text-apple-ink text-xl font-bold">
              {formatMoney(order.subtotal ?? order.total, order.currency_code)}
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Alert Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <AlertCircle className="size-5 text-rose-600" />
              Отмена заказа
            </DialogTitle>
            <DialogDescription>
              Укажите причину отмены заказа. Это сообщение увидят администраторы маркетплейса.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Причина отмены (обязательно)..."
              rows={4}
              disabled={isUpdatingStatus}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={isUpdatingStatus} onClick={() => setIsCancelModalOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={isUpdatingStatus || cancellationReason.trim().length < 3}
              onClick={handleConfirmCancel}
            >
              {isUpdatingStatus && <Loader2 className="mr-2 size-4 animate-spin" />}
              Подтвердить отмену
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
