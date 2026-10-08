'use client'

import { useState } from 'react'

import Link from 'next/link'

import type { StoreOrder } from '@medusajs/types'
import { ChevronRight, Package } from 'lucide-react'

import { useI18n } from '@/components/providers/I18nProvider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPrice } from '@/features/cart/utils'
import { useMyProductReviews } from '@/features/reviews/api/queries'
import { OrderStores } from '@/features/store-reviews/components/OrderStores'
import { intlLocale } from '@/lib/i18n'

import { OrderDetailModal } from './OrderDetailModal'
import { OrderReviewDialog } from './OrderReviewDialog'
import { DeliveryStatusBadge, isOrderCancelled, isOrderDelivered } from './order-status'

interface OrdersTabProps {
  orders: StoreOrder[]
}

type OrderFilter = 'all' | 'processing' | 'delivered' | 'canceled'

function formatItemCount(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} товаров`
  if (mod10 === 1) return `${count} товар`
  if (mod10 >= 2 && mod10 <= 4) return `${count} товара`
  return `${count} товаров`
}

function OrderItemThumbnail({ src, title }: { src?: string | null; title?: string | null }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="border-apple-hairline bg-apple-surface-pearl text-apple-ink-muted-48 rounded-apple-sm flex h-11 w-11 shrink-0 items-center justify-center border">
        <Package className="h-5 w-5 opacity-40" />
      </div>
    )
  }

  return (
    <div className="border-apple-hairline bg-apple-surface-pearl rounded-apple-sm relative h-11 w-11 shrink-0 overflow-hidden border">
      <img src={src} alt={title ?? 'Товар'} className="h-full w-full object-cover" onError={() => setHasError(true)} />
    </div>
  )
}

export function OrdersTab({ orders }: OrdersTabProps) {
  const { locale } = useI18n()
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null)
  const [reviewProduct, setReviewProduct] = useState<{ id: string; title: string; thumbnail?: string | null } | null>(
    null,
  )

  const completedProductIds = orders
    .filter(
      (order) =>
        order.status === 'completed' && order.payment_status === 'captured' && order.fulfillment_status === 'fulfilled',
    )
    .flatMap((order) => order.items ?? [])
    .map((item) => item.variant?.product?.id)
    .filter((productId): productId is string => Boolean(productId))
  const { data: myReviews } = useMyProductReviews(completedProductIds)
  const reviewsByProduct = new Map(myReviews?.reviews.map((review) => [review.product_id, review]))

  const filteredOrders = orders
    .filter((order) => {
      if (filter === 'processing') return !isOrderDelivered(order) && !isOrderCancelled(order)
      if (filter === 'delivered') return isOrderDelivered(order)
      if (filter === 'canceled') return isOrderCancelled(order)
      return true
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-row items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <h2 className="text-apple-ink flex items-center gap-2 text-xl font-semibold tracking-[-0.28px]">
            <Package className="text-apple-primary h-5 w-5" /> История заказов
          </h2>
          <p className="text-apple-ink-muted-48 text-apple-caption mt-0.5">Всего заказов: {orders.length}</p>
        </div>

        {/* Filter Chips */}
        {orders.length > 0 && (
          <div className="bg-apple-canvas border-apple-hairline flex flex-wrap gap-1.5 rounded-full border p-1">
            {(
              [
                { key: 'all', label: 'Все' },
                { key: 'processing', label: 'В обработке' },
                { key: 'delivered', label: 'Доставлены' },
                { key: 'canceled', label: 'Отмененные' },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-apple-primary text-white shadow-none'
                    : 'text-apple-ink-muted-80 hover:bg-apple-surface-pearl'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="rounded-apple-lg border-apple-hairline bg-apple-canvas gap-0 border p-12 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
          <h3 className="text-apple-ink text-base font-semibold">Заказы не найдены</h3>
          <p className="text-apple-ink-muted-48 text-apple-caption mt-1 mb-4">
            {filter === 'all' ? 'Вы ещё не оформили ни одного заказа.' : 'В выбранной категории нет заказов.'}
          </p>
          <Button asChild className="bg-apple-primary rounded-full px-6 text-sm font-semibold text-white">
            <Link href="/">Перейти к покупкам</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const itemCount = order.items?.reduce((acc, item) => acc + (item.quantity ?? 1), 0) ?? 0
            const canReviewOrder =
              order.status === 'completed' &&
              order.payment_status === 'captured' &&
              order.fulfillment_status === 'fulfilled'

            return (
              <Card
                key={order.id}
                className="rounded-apple-lg border-apple-hairline bg-apple-canvas gap-0 border p-5 transition-all hover:border-neutral-300"
              >
                {/* Order Summary Header */}
                <div className="border-apple-divider-soft flex flex-row items-center justify-between gap-4 border-b pb-4 max-sm:flex-col max-sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-apple-ink text-base font-semibold">
                        Заказ #{order.display_id || order.id.slice(-6)}
                      </span>
                      <DeliveryStatusBadge order={order} />
                    </div>
                    <p className="text-apple-ink-muted-48 text-apple-caption mt-1">
                      Оформлен {new Date(order.created_at).toLocaleDateString(intlLocale(locale))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right max-sm:w-full max-sm:justify-between max-sm:text-left">
                    <div>
                      <span className="text-apple-ink font-mono text-lg font-bold">
                        {formatPrice(order.total, order.currency_code, locale)}
                      </span>
                      <p className="text-apple-ink-muted-48 text-xs">{formatItemCount(itemCount)}</p>
                    </div>
                    <Button onClick={() => setSelectedOrder(order)} variant="outline" size="xs">
                      О заказе <ChevronRight className="ml-0.5 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <OrderStores orderId={order.id} />

                {/* Line Items Table */}
                {order.items && order.items.length > 0 ? (
                  <div className="border-apple-hairline rounded-apple-md bg-apple-canvas mt-4 overflow-hidden border">
                    <Table>
                      <TableHeader className="bg-apple-surface-pearl/60">
                        <TableRow className="border-apple-hairline hover:bg-transparent">
                          <TableHead className="min-w-[200px]">Товар</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Цена</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Кол-во</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Сумма</TableHead>
                          {canReviewOrder && <TableHead className="text-right whitespace-nowrap">Отзыв</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => {
                          const productId = item.variant?.product?.id
                          const handle = item.variant?.product?.handle
                          const existingReview = productId ? reviewsByProduct.get(productId) : undefined
                          const canReviewItem = canReviewOrder && Boolean(productId)
                          const lineTotal = (item.unit_price ?? 0) * (item.quantity ?? 1)
                          const thumbnail = item.thumbnail || item.variant?.product?.thumbnail

                          return (
                            <TableRow
                              key={item.id}
                              className="border-apple-divider-soft hover:bg-apple-surface-pearl/40"
                            >
                              {/* Product Info */}
                              <TableCell className="py-3">
                                <div className="flex items-center gap-3">
                                  <OrderItemThumbnail src={thumbnail} title={item.title} />
                                  <div className="min-w-0 flex-1">
                                    {handle ? (
                                      <Link
                                        href={`/product/${handle}`}
                                        className="text-apple-ink hover:text-apple-primary line-clamp-2 text-[13px] font-semibold tracking-tight transition-colors hover:underline"
                                      >
                                        {item.title}
                                      </Link>
                                    ) : (
                                      <span className="text-apple-ink line-clamp-2 text-[13px] font-semibold tracking-tight">
                                        {item.title}
                                      </span>
                                    )}
                                    {item.subtitle && (
                                      <p className="text-apple-ink-muted-48 mt-0.5 line-clamp-1 text-[11px]">
                                        {item.subtitle}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              {/* Unit Price */}
                              <TableCell className="text-apple-ink-muted-80 py-3 text-right font-mono text-[13px] whitespace-nowrap">
                                {formatPrice(item.unit_price, order.currency_code, locale)}
                              </TableCell>

                              {/* Quantity */}
                              <TableCell className="text-apple-ink py-3 text-center font-mono text-[13px] whitespace-nowrap">
                                {item.quantity} шт.
                              </TableCell>

                              {/* Total */}
                              <TableCell className="text-apple-ink py-3 text-right font-mono text-[13px] font-semibold whitespace-nowrap">
                                {formatPrice(lineTotal, order.currency_code, locale)}
                              </TableCell>

                              {/* Review Action */}
                              {canReviewOrder && (
                                <TableCell className="py-3 text-right whitespace-nowrap">
                                  {canReviewItem && productId ? (
                                    <Button
                                      type="button"
                                      variant={existingReview ? 'outline' : 'default'}
                                      size="xs"
                                      onClick={() =>
                                        setReviewProduct({
                                          id: productId,
                                          title: item.title ?? 'Товар',
                                          thumbnail: thumbnail,
                                        })
                                      }
                                      className="rounded-apple-pill px-3 text-[11px] font-semibold whitespace-nowrap"
                                    >
                                      {existingReview ? 'Изменить отзыв' : 'Оставить отзыв'}
                                    </Button>
                                  ) : null}
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Drawer Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
      />
      {reviewProduct && (
        <OrderReviewDialog
          product={reviewProduct}
          review={reviewsByProduct.get(reviewProduct.id)}
          open={Boolean(reviewProduct)}
          onOpenChange={(open) => !open && setReviewProduct(null)}
        />
      )}
    </div>
  )
}
