'use client'

import { useId, useState } from 'react'

import type { OrderStore } from '@dtc/api-contracts'
import { Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { useSaveStoreReview } from '../api/queries'

export function StoreReviewDialog({ store, onClose }: { store: OrderStore; onClose: () => void }) {
  const [rating, setRating] = useState(store.review?.rating ?? 5)
  const [comment, setComment] = useState(store.review?.comment ?? '')
  const commentId = useId()
  const mutation = useSaveStoreReview(store.vendor.id, store.order_id, store.review?.id)

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose()
      }}
    >
      <DialogContent className="rounded-apple-lg border-apple-hairline bg-apple-canvas max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>{store.review ? 'Изменить отзыв о магазине' : 'Оставить отзыв о магазине'}</DialogTitle>
          <DialogDescription>{store.vendor.name}. Отзыв будет виден другим покупателям.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!comment.trim() || mutation.isPending) return
            mutation.mutate({ rating, comment: comment.trim() }, { onSuccess: onClose })
          }}
        >
          <fieldset disabled={mutation.isPending}>
            <legend className="text-apple-ink text-sm font-semibold">Ваша оценка</legend>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className="rounded-apple-sm focus-within:ring-apple-primary relative flex size-11 cursor-pointer items-center justify-center focus-within:ring-2"
                >
                  <input
                    type="radio"
                    name="store-rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    className="sr-only"
                    aria-label={`${value} из 5`}
                  />
                  <Star
                    aria-hidden
                    className={cn(
                      'size-6',
                      value <= rating ? 'fill-amber-400 text-amber-400' : 'text-apple-divider-soft',
                    )}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <label htmlFor={commentId} className="text-apple-ink text-sm font-semibold">
              Ваш отзыв
            </label>
            <Textarea
              id={commentId}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
              maxLength={2000}
              disabled={mutation.isPending}
              className="min-h-28 resize-y"
              aria-describedby={`${commentId}-count`}
              placeholder="Расскажите о товарах, упаковке и обслуживании магазина"
            />
            <p id={`${commentId}-count`} className="text-apple-ink-muted-48 text-xs">
              {comment.length} / 2000
            </p>
          </div>
          {mutation.isError && (
            <p role="alert" className="text-destructive text-sm">
              {mutation.error.message || 'Не удалось сохранить отзыв. Попробуйте ещё раз.'}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button type="submit" className="min-h-11" disabled={mutation.isPending || !comment.trim()}>
              {mutation.isPending ? 'Сохраняем…' : store.review ? 'Сохранить отзыв' : 'Опубликовать отзыв'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
