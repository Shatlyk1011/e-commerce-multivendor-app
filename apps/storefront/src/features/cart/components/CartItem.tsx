'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import type { StoreCartLineItem } from '@medusajs/types'
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
import { SheetClose } from '@/components/ui/sheet'
import { getCartId } from '@/lib/cart-cookies'
import { cn } from '@/lib/utils'

import { useDeleteLineItem, useUpdateLineItem } from '../api/queries'
import { formatPrice } from '../utils'

interface CartItemProps {
  item: StoreCartLineItem
}

function getVariantDetails(item: CartItemProps['item']) {
  const details: string[] = []

  if (item.variant?.options && item.variant.options.length > 0) {
    item.variant.options.forEach((opt) => {
      if (opt.value) {
        const optionName = opt.option?.title
        details.push(optionName ? `${optionName}: ${opt.value}` : opt.value)
      }
    })
  }

  if (details.length === 0 && item.variant_option_values && typeof item.variant_option_values === 'object') {
    Object.entries(item.variant_option_values).forEach(([key, val]) => {
      if (val) details.push(`${key}: ${String(val)}`)
    })
  }

  if (details.length === 0) {
    const vTitle = item.variant?.title || item.variant_title || item.subtitle
    if (vTitle && !['default variant', 'default'].includes(vTitle.toLowerCase().trim())) {
      details.push(vTitle)
    }
  }

  return details
}

export function CartItem({ item }: CartItemProps) {
  const cartId = getCartId()
  const updateMutation = useUpdateLineItem()
  const deleteMutation = useDeleteLineItem()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [localQuantity, setLocalQuantity] = useState(item.quantity ?? 1)

  // Keep local quantity synced with item.quantity from server
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQuantity(item.quantity ?? 1)
  }, [item.quantity])

  const title = item.title ?? 'Товар'
  const thumbnail = item.thumbnail ?? ''
  const priceTotal = (item.unit_price ?? 0) * localQuantity
  const isPending = updateMutation.isPending || deleteMutation.isPending

  const productHandleOrId =
    item.variant?.product?.handle ||
    item.product_handle ||
    item.variant?.product?.id ||
    item.variant?.product_id ||
    item.product_id

  const variantDetails = getVariantDetails(item)

  const handleIncrement = async () => {
    if (!cartId || !item.id || isPending) return
    const nextQty = localQuantity + 1
    setLocalQuantity(nextQty)

    try {
      await updateMutation.mutateAsync({
        cartId: cartId ?? undefined,
        lineId: item.id,
        payload: { quantity: nextQty },
      })
    } catch {
      // Revert back to original item quantity on failure
      setLocalQuantity(item.quantity ?? 1)
    }
  }

  const handleDecrement = async () => {
    if (!cartId || !item.id || isPending) return
    const nextQty = localQuantity - 1
    if (nextQty <= 0) {
      setIsDeleteDialogOpen(true)
    } else {
      setLocalQuantity(nextQty)
      try {
        await updateMutation.mutateAsync({
          cartId: cartId ?? undefined,
          lineId: item.id,
          payload: { quantity: nextQty },
        })
      } catch {
        // Revert back to original item quantity on failure
        setLocalQuantity(item.quantity ?? 1)
      }
    }
  }

  const handleRemove = async () => {
    if (!cartId || !item.id) return
    setIsDeleteDialogOpen(false)
    try {
      await deleteMutation.mutateAsync({ cartId: cartId ?? undefined, lineId: item.id })
    } catch {
      // Ignore error if already handled by query onError
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setLocalQuantity(item.quantity ?? 1)
  }

  const imageElement = thumbnail ? (
    <img src={thumbnail} alt={title} className="bg-apple-surface-pearl h-16 w-16 shrink-0 rounded-md object-cover" />
  ) : (
    <div className="h-16 w-16 shrink-0 rounded-md bg-neutral-200" />
  )

  const titleElement = (
    <h4 className="text-apple-ink hover:text-apple-primary line-clamp-2 text-[13px] leading-snug font-semibold transition-colors">
      {title}
    </h4>
  )

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
            {productHandleOrId ? (
              <SheetClose asChild>
                <Link href={`/product/${productHandleOrId}`} className="shrink-0">
                  {imageElement}
                </Link>
              </SheetClose>
            ) : (
              imageElement
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {productHandleOrId ? (
                    <SheetClose asChild>
                      <Link href={`/product/${productHandleOrId}`}>{titleElement}</Link>
                    </SheetClose>
                  ) : (
                    titleElement
                  )}

                  {variantDetails.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {variantDetails.map((detail, idx) => (
                        <span
                          key={idx}
                          className="bg-apple-canvas border-apple-hairline text-apple-ink-muted-80 rounded px-1.5 py-0.5 text-[11px] font-medium"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
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
