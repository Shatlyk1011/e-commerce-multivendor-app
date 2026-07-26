'use client'

import * as React from 'react'

import { BadgeCheck, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { cn } from '@/lib/utils'

import { useCreateProductReview, useProductReviews, useReviewEligibility } from '../api/queries'

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`Оценка ${rating} из 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            'size-4',
            value <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-apple-divider-soft',
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function ProductReviews({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth()
  const { data, isLoading } = useProductReviews(productId)
  const { data: eligibility } = useReviewEligibility(productId, isAuthenticated)
  const createReview = useCreateProductReview(productId)
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState('')
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createReview.mutate({ rating, comment: comment.trim() }, { onSuccess: () => setComment('') })
  }

  return (
    <section id="reviews" className="border-apple-divider-soft mt-12 border-t pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-apple-ink text-[20px] font-semibold">Отзывы покупателей</h2>
          {data?.summary.review_count ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-apple-ink text-[24px] font-semibold">{data.summary.average_rating}</span>
              <Stars rating={data.summary.average_rating ?? 0} />
              <span className="text-apple-ink-muted-48 text-sm">{data.summary.review_count} отзывов</span>
            </div>
          ) : (
            <p className="text-apple-ink-muted-48 mt-2 text-sm">
              Пока нет отзывов. Будьте первым, кто поделится опытом.
            </p>
          )}
        </div>
        {eligibility?.existing_review && (
          <span className="text-apple-ink-muted-48 text-sm">Ваш отзыв уже опубликован</span>
        )}
      </div>

      {eligibility?.can_review && (
        <form
          onSubmit={submit}
          className="bg-apple-canvas-parchment rounded-apple-lg border-apple-hairline mt-6 border p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-apple-ink text-sm font-semibold">Оцените товар</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Поставить ${value} из 5`}
                  onClick={() => setRating(value)}
                  className="cursor-pointer p-0.5"
                >
                  <Star
                    className={cn(
                      'size-5',
                      value <= rating ? 'fill-amber-400 text-amber-400' : 'text-apple-divider-soft',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            minLength={3}
            maxLength={800}
            required
            placeholder="Коротко расскажите, что вам понравилось или можно улучшить"
            className="bg-apple-canvas min-h-24 resize-y"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-apple-ink-muted-48 text-xs">Отзыв будет отмечен как подтверждённая покупка.</span>
            <Button type="submit" disabled={createReview.isPending} className="cursor-pointer">
              {createReview.isPending ? 'Публикуем…' : 'Опубликовать'}
            </Button>
          </div>
        </form>
      )}
      {!isAuthenticated && (
        <p className="text-apple-ink-muted-48 mt-6 text-sm">
          Войдите и получите товар, чтобы оставить подтверждённый отзыв.
        </p>
      )}
      <div className="mt-7 space-y-5">
        {isLoading && <p className="text-apple-ink-muted-48 text-sm">Загружаем отзывы…</p>}
        {data?.reviews.map((review) => (
          <article key={review.id} className="border-apple-divider-soft border-b pb-5 last:border-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-apple-ink text-sm font-semibold">{review.author_name}</span>
              <Stars rating={review.rating} />
              {review.verified_purchase && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <BadgeCheck className="size-3.5" /> Подтверждённая покупка
                </span>
              )}
              <time className="text-apple-ink-muted-48 text-xs">
                {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(review.created_at))}
              </time>
            </div>
            <p className="text-apple-ink mt-2 text-sm leading-relaxed">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
