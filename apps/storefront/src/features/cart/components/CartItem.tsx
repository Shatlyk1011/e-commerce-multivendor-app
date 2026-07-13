'use client'

import { useEffect, useRef, useState } from 'react'

import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCartId } from '@/lib/cart-cookies'
import { cn } from '@/lib/utils'

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [prevQuantity, setPrevQuantity] = useState(item.quantity)
  const [localQuantity, setLocalQuantity] = useState(item.quantity ?? 1)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  if (item.quantity !== prevQuantity) {
    setPrevQuantity(item.quantity)
    setLocalQuantity(item.quantity ?? 1)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const title = item.title ?? 'Товар'
  const thumbnail = item.thumbnail ?? ''
  const priceTotal = (item.unit_price ?? 0) * (item.quantity ?? 0)
  const isPending = updateMutation.isPending || deleteMutation.isPending

  const triggerDebouncedUpdate = (qty: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      updateMutation.mutate({
        cartId: cartId ?? undefined,
        lineId: item.id,
        payload: { quantity: qty },
      })
    }, 500)
  }

  const handleIncrement = () => {
    if (!cartId || !item.id) return
    const nextQty = localQuantity + 1
    setLocalQuantity(nextQty)
    triggerDebouncedUpdate(nextQty)
  }

  const handleDecrement = () => {
    if (!cartId || !item.id) return
    const nextQty = localQuantity - 1
    if (nextQty <= 0) {
      setIsDeleteDialogOpen(true)
    } else {
      setLocalQuantity(nextQty)
      triggerDebouncedUpdate(nextQty)
    }
  }

  const handleRemove = () => {
    if (!cartId || !item.id) return
    setIsDeleteDialogOpen(false)
    deleteMutation.mutate({ cartId: cartId ?? undefined, lineId: item.id })
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setLocalQuantity(item.quantity ?? 1)
  }

  return (
    <li className="border-apple-divider-soft border-b pb-4">
      <Card className="rounded-apple-sm border-apple-hairline bg-apple-canvas-parchment relative overflow-hidden border">
        {isPending && (
          <div className="bg-apple-canvas/30 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[0.5px] transition-opacity duration-200">
            <Loader2 className="text-apple-primary size-5 animate-spin" />
          </div>
        )}
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
                  onClick={() => setIsDeleteDialogOpen(true)}
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
                  <span
                    className={cn(
                      'text-apple-ink w-6 text-center text-[13px] font-semibold transition-opacity duration-200',
                    )}
                  >
                    {localQuantity}
                  </span>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить <br /> <span className="font-medium">«{title}»</span> из корзины?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-4">
            <AlertDialogCancel size="sm" onClick={handleCancelDelete} disabled={isPending}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction size="sm" onClick={handleRemove} disabled={isPending} variant="destructive">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}
