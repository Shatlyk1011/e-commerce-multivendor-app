'use client'

import { useState } from 'react'

import Link from 'next/link'

import type { StoreOrder } from '@medusajs/types'
import { ArrowRight, ChevronRight, Package, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/features/cart/utils'
import { useMyProductReviews } from '@/features/reviews/api/queries'

import { OrderDetailModal } from './OrderDetailModal'
import { OrderReviewDialog } from './OrderReviewDialog'

interface OrdersTabProps {
  orders: StoreOrder[]
}

type OrderFilter = 'all' | 'processing' | 'delivered' | 'canceled'

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

export function OrdersTab({ orders }: OrdersTabProps) {
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

  const filteredOrders = orders.filter((order) => {
    if (filter === 'processing')
      return !['fulfilled', 'shipped', 'delivered', 'canceled'].includes(order.fulfillment_status ?? '')
    if (filter === 'delivered') return ['fulfilled', 'shipped', 'delivered'].includes(order.fulfillment_status ?? '')
    if (filter === 'canceled') return order.status === 'canceled' || order.payment_status === 'canceled'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
                    ? 'bg-apple-primary text-white shadow-sm'
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
        <Card className="rounded-apple-lg border-apple-hairline bg-apple-canvas border p-12 text-center">
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
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const itemCount = order.items?.reduce((acc, item) => acc + (item.quantity ?? 1), 0) ?? 0
            return (
              <Card
                key={order.id}
                className="rounded-apple-lg border-apple-hairline bg-apple-canvas border p-5 transition-all hover:border-neutral-300"
              >
                <div className="border-apple-divider-soft flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-apple-ink text-base font-semibold">
                        Заказ #{order.display_id || order.id.slice(-6)}
                      </span>
                      {getFulfillmentStatusBadge(order.fulfillment_status)}
                    </div>
                    <p className="text-apple-ink-muted-48 text-apple-caption mt-1">
                      Оформлен {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <span className="text-apple-ink text-lg font-bold">
                        {formatPrice(order.total, order.currency_code)}
                      </span>
                      <p className="text-apple-ink-muted-48 text-xs">{itemCount} товаров</p>
                    </div>
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="outline"
                      className="border-apple-hairline hover:bg-apple-surface-pearl rounded-full text-xs font-semibold"
                    >
                      Детали <ChevronRight className="ml-0.5 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Line Items Preview Grid */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  {order.items?.map((item) => {
                    const productId = item.variant?.product?.id
                    const canReview =
                      order.status === 'completed' &&
                      order.payment_status === 'captured' &&
                      order.fulfillment_status === 'fulfilled' &&
                      Boolean(productId)
                    const existingReview = productId ? reviewsByProduct.get(productId) : undefined
                    return (
                      <div
                        key={item.id}
                        className="bg-apple-surface-pearl border-apple-hairline rounded-apple-sm flex items-center gap-2.5 border p-2 pr-3"
                      >
                        <div className="border-apple-hairline h-10 w-10 shrink-0 overflow-hidden rounded border bg-white">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-neutral-200" />
                          )}
                        </div>
                        <div className="max-w-[140px] min-w-0">
                          <p className="text-apple-ink truncate text-[12px] font-semibold">{item.title}</p>
                          <p className="text-apple-ink-muted-48 font-mono text-[11px]">
                            {item.quantity} шт. × {formatPrice(item.unit_price, order.currency_code)}
                          </p>
                        </div>
                        {canReview && productId && (
                          <Button
                            type="button"
                            variant={existingReview ? 'outline' : 'default'}
                            size="sm"
                            onClick={() =>
                              setReviewProduct({
                                id: productId,
                                title: item.title ?? 'Товар',
                                thumbnail: item.thumbnail,
                              })
                            }
                            className="ml-auto shrink-0 rounded-full px-3 text-[11px] font-semibold"
                          >
                            {existingReview ? 'Изменить отзыв' : 'Оставить отзыв'}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
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
