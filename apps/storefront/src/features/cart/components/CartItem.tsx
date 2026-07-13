'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCartId } from '@/lib/cart-cookies'

import { useDeleteLineItem, useUpdateLineItem } from '../api/queries'
import { formatPrice } from '../utils'

interface CartItemProps {
  item: {
    id: string
    title?: string
    subtitle?: string
    thumbnail?: string
    quantity?: number
    unit_price?: number
  }
}

export function CartItem({ item }: CartItemProps) {
  const cartId = getCartId()
  const updateMutation = useUpdateLineItem()
  const deleteMutation = useDeleteLineItem()

  const title = item.title ?? 'Товар'
  const thumbnail = item.thumbnail ?? ''
  const priceTotal = (item.unit_price ?? 0) * (item.quantity ?? 0)
  const isPending = updateMutation.isPending || deleteMutation.isPending

  const handleIncrement = () => {
    if (!cartId || !item.id) return
    updateMutation.mutate({
      cartId,
      lineId: item.id,
      payload: { quantity: (item.quantity ?? 1) + 1 },
    })
  }

  const handleDecrement = () => {
    if (!cartId || !item.id) return
    const newQty = (item.quantity ?? 1) - 1
    if (newQty <= 0) {
      deleteMutation.mutate({ cartId, lineId: item.id })
    } else {
      updateMutation.mutate({
        cartId,
        lineId: item.id,
        payload: { quantity: newQty },
      })
    }
  }

  const handleRemove = () => {
    if (!cartId || !item.id) return
    deleteMutation.mutate({ cartId, lineId: item.id })
  }

  return (
    <li className="border-apple-divider-soft border-b pb-4">
      <Card className="rounded-apple-sm border-apple-hairline bg-apple-canvas-parchment overflow-hidden border">
        <CardContent className="p-3">
          <div className="flex gap-3">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="bg-apple-surface-pearl h-16 w-16 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-md bg-neutral-200" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-apple-ink line-clamp-2 text-[13px] leading-snug font-semibold">{title}</h4>
                  {item.subtitle && (
                    <p className="text-apple-ink-muted-80 mt-0.5 line-clamp-1 text-[12px]">{item.subtitle}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleRemove}
                  disabled={isPending}
                  className="text-apple-ink-muted-48 shrink-0 cursor-pointer hover:text-rose-500"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="mt-3 flex items-end justify-between gap-2">
                {/* Quantity stepper */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleDecrement}
                    disabled={isPending}
                    className="rounded-apple-sm border-apple-hairline size-7 cursor-pointer border"
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="text-apple-ink w-6 text-center text-[13px] font-semibold">{item.quantity ?? 1}</span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={handleIncrement}
                    disabled={isPending}
                    className="rounded-apple-sm border-apple-hairline size-7 cursor-pointer border"
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>

                {/* Line total */}
                <span className="text-apple-ink text-[15px] font-bold">{formatPrice(priceTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
