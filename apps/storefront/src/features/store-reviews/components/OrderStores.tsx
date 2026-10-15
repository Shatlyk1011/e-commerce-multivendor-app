'use client'

import { useState } from 'react'

import type { OrderStore } from '@dtc/api-contracts'
import { Store } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useOrderStores } from '../api/queries'
import { StoreReviewDialog } from './StoreReviewDialog'

const statusLabels: Record<string, string> = {
  awaiting_confirmation: 'Ожидает подтверждения',
  preparing: 'Собирается',
  ready_for_pickup: 'Готов к выдаче',
  out_for_delivery: 'Передан курьеру',
  picked_up: 'Получен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export function OrderStores({ orderId }: { orderId: string }) {
  const { data, isLoading, isError, refetch } = useOrderStores(orderId)
  const [selectedStore, setSelectedStore] = useState<OrderStore | null>(null)

  if (isLoading)
    return (
      <p role="status" className="text-apple-ink-muted-48 mt-4 text-sm">
        Загружаем магазины заказа…
      </p>
    )
  if (isError)
    return (
      <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <p>Не удалось загрузить магазины и отзывы.</p>
        <Button variant="outline" className="min-h-11" onClick={() => refetch()}>
          Повторить
        </Button>
      </div>
    )
  if (!data?.stores.length) return null

  return (
    <section className="mt-4 space-y-3" aria-label="Магазины в заказе">
      {data.stores.map((store) => (
        <div key={store.order_id} className="border-apple-hairline bg-apple-surface-pearl rounded-apple-md border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-apple-ink flex items-center gap-2 text-sm font-semibold">
                <Store className="size-4 shrink-0" aria-hidden />
                {store.vendor.name}
              </h3>
              <p className="text-apple-ink-muted-48 mt-1 text-xs">
                {statusLabels[store.delivery_status ?? ''] ?? 'В обработке'}
              </p>
            </div>
            {(store.review || store.can_review) && (
              <Button
                variant={store.review ? 'ghost' : 'default'}
                size="sm"
                className="max-sm:w-full"
                onClick={() => setSelectedStore(store)}
              >
                {store.review ? 'Изменить отзыв о магазине' : 'Оставить отзыв о магазине'}
              </Button>
            )}
          </div>
          <ul className="text-apple-ink-muted-80 mt-3 space-y-1 text-sm">
            {store.items.map((item) => (
              <li key={item.id} className="break-words">
                {item.title} — {item.quantity ?? 1} шт.
              </li>
            ))}
          </ul>
          {store.review ? (
            <div className="border-apple-divider-soft mt-3 border-t pt-3">
              <p className="text-apple-ink text-xs font-semibold">Ваш отзыв о магазине · {store.review.rating} из 5</p>
              <p className="text-apple-ink-muted-48 mt-1 text-xs" role="status">
                {store.review.status === 'approved'
                  ? 'Опубликован'
                  : store.review.status === 'rejected'
                    ? 'Не прошёл проверку. Вы можете изменить и отправить его снова.'
                    : 'Ожидает проверки администратором'}
              </p>
              <p className="text-apple-ink-muted-80 mt-1 text-sm break-words whitespace-pre-wrap">
                {store.review.comment}
              </p>
            </div>
          ) : (
            <p className="text-apple-ink-muted-48 mt-3 text-xs">
              {store.delivery_status === 'cancelled'
                ? 'Для отменённого заказа отзыв недоступен.'
                : store.can_review
                  ? 'Поделитесь впечатлениями о магазине.'
                  : 'Отзыв станет доступен после получения товаров этого магазина.'}
            </p>
          )}
        </div>
      ))}
      {selectedStore && <StoreReviewDialog store={selectedStore} onClose={() => setSelectedStore(null)} />}
    </section>
  )
}
