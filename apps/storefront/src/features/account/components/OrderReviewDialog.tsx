'use client'

import { useEffect, useState } from 'react'

import { BadgeCheck, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { MyProductReview } from '@/features/reviews/api/client'
import { useCreateProductReview, useUpdateProductReview } from '@/features/reviews/api/queries'
import { cn } from '@/lib/utils'

interface OrderReviewDialogProps {
  product: { id: string; title: string; thumbnail?: string | null }
  review?: MyProductReview
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderReviewDialog({ product, review, open, onOpenChange }: OrderReviewDialogProps) {
  const [rating, setRating] = useState(review?.rating ?? 5)
  const [comment, setComment] = useState(review?.comment ?? '')
  const createReview = useCreateProductReview(product.id)
  const updateReview = useUpdateProductReview(product.id)

  useEffect(() => {
    setRating(review?.rating ?? 5)
    setComment(review?.comment ?? '')
  }, [review, open])

  const isEditing = Boolean(review)
  const isPending = createReview.isPending || updateReview.isPending

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = { rating, comment: comment.trim() }
    if (review) {
      updateReview.mutate({ reviewId: review.id, ...body }, { onSuccess: () => onOpenChange(false) })
      return
    }
    createReview.mutate(body, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-apple-lg border-apple-hairline bg-apple-canvas max-w-lg p-6">
        <DialogHeader className="border-apple-divider-soft border-b pb-4">
          <DialogTitle className="text-apple-ink text-xl font-semibold tracking-[-0.28px]">
            {isEditing ? 'Изменить отзыв' : 'Оставить отзыв'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 pt-1">
          <div className="bg-apple-surface-pearl border-apple-hairline rounded-apple-sm flex items-center gap-3 border p-3">
            <div className="border-apple-hairline size-12 shrink-0 overflow-hidden rounded border bg-white">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-neutral-200" />
              )}
            </div>
            <p className="text-apple-ink line-clamp-2 text-sm font-semibold">{product.title}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-apple-ink text-sm font-semibold">Ваша оценка</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`Поставить ${value} из 5`}
                  className="cursor-pointer p-1"
                >
                  <Star
                    className={cn(
                      'size-6',
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
            required
            minLength={3}
            maxLength={800}
            className="min-h-28 resize-y"
            placeholder="Расскажите о качестве, доставке или впечатлениях от товара"
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <BadgeCheck className="size-4" /> Подтверждённая покупка
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Отмена
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-full">
                {isPending ? 'Сохраняем…' : isEditing ? 'Сохранить отзыв' : 'Опубликовать отзыв'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
