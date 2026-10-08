'use client'

import { useState } from 'react'

import Link from 'next/link'

import { BadgeCheck, Star } from 'lucide-react'

import { useI18n } from '@/components/providers/I18nProvider'
import { Button } from '@/components/ui/button'
import { intlLocale } from '@/lib/i18n'

import { useStoreReviews } from '../api/queries'

export function StoreReviews({ vendorId, storeName }: { vendorId: string; storeName: string }) {
  const { locale } = useI18n()
  const [offset, setOffset] = useState(0)
  const query = useStoreReviews(vendorId, offset)
  const data = query.data

  return (
    <section id="store-reviews" className="border-apple-divider-soft mt-10 border-t pt-8">
      <h2 className="font-heading text-apple-ink text-xl font-semibold">Отзывы о магазине</h2>
      <p className="text-apple-ink-muted-80 mt-1 text-sm">
        {storeName} · Впечатления покупателей о товарах и обслуживании магазина
      </p>
      {query.isLoading && (
        <p role="status" className="text-apple-ink-muted-48 mt-4 text-sm">
          Загружаем отзывы…
        </p>
      )}
      {query.isError && (
        <div role="alert" className="mt-4 space-y-2 text-sm">
          <p>Не удалось загрузить отзывы о магазине.</p>
          <Button variant="outline" className="min-h-11" onClick={() => query.refetch()}>
            Повторить
          </Button>
        </div>
      )}
      {data && (
        <>
          {data.summary.review_count ? (
            <div
              className="text-apple-ink mt-3 flex items-center gap-2"
              aria-label={`Оценка магазина ${data.summary.average_rating} из 5, отзывов: ${data.summary.review_count}`}
            >
              <Star className="size-5 fill-amber-400 text-amber-400" aria-hidden />
              <span className="text-2xl font-semibold">{data.summary.average_rating} / 5</span>
              <span className="text-apple-ink-muted-48 text-sm">Отзывов: {data.summary.review_count}</span>
            </div>
          ) : (
            <p className="text-apple-ink-muted-48 mt-3 text-sm">У этого магазина пока нет отзывов.</p>
          )}
          <div className="mt-6 space-y-5" aria-live="polite">
            {data.reviews.map((review) => (
              <article key={review.id} className="border-apple-divider-soft border-b pb-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-apple-ink font-semibold">{review.author_name}</span>
                  <span className="flex items-center gap-1" aria-label={`Оценка ${review.rating} из 5`}>
                    <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                    {review.rating} / 5
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <BadgeCheck className="size-4" aria-hidden />
                    Подтверждённая покупка
                  </span>
                  <time dateTime={review.created_at} className="text-apple-ink-muted-48 text-xs">
                    {new Date(review.created_at).toLocaleDateString(intlLocale(locale))}
                  </time>
                </div>
                <p className="text-apple-ink mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
          {(offset > 0 || offset + data.limit < data.count) && (
            <nav aria-label="Страницы отзывов о магазине" className="mt-4 flex items-center gap-3">
              <Button
                variant="outline"
                className="min-h-11"
                disabled={offset === 0 || query.isFetching}
                onClick={() => setOffset(Math.max(0, offset - 10))}
              >
                Назад
              </Button>
              <span className="text-apple-ink-muted-48 text-sm">
                {offset + 1}–{Math.min(offset + data.limit, data.count)} из {data.count}
              </span>
              <Button
                variant="outline"
                className="min-h-11"
                disabled={offset + data.limit >= data.count || query.isFetching}
                onClick={() => setOffset(offset + 10)}
              >
                Далее
              </Button>
            </nav>
          )}
        </>
      )}
      <p className="text-apple-ink-muted-48 mt-5 text-sm">
        Получили заказ?{' '}
        <Link href="/account/orders" className="text-apple-primary underline underline-offset-4">
          Оставьте отзыв о магазине в истории заказов.
        </Link>
      </p>
    </section>
  )
}
