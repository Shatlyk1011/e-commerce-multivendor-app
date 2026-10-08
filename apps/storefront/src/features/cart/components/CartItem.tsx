'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import type { StoreCartLineItem } from '@medusajs/types'
import { ImageOff, Loader2, Minus, Plus, Trash2 } from 'lucide-react'

import { useI18n } from '@/components/providers/I18nProvider'
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
  isSheet?: boolean
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

export function CartItem({ item, isSheet = false }: CartItemProps) {
  const { locale } = useI18n()
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
  const unitPrice = item.unit_price ?? 0
  const priceTotal = unitPrice * localQuantity
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

  const imageSizeClass = isSheet ? 'size-16' : 'size-20 max-sm:size-16'

  const imageElement = thumbnail ? (
    <div
      className={cn(
        'rounded-apple-md border-apple-hairline/80 bg-apple-surface-pearl group relative shrink-0 overflow-hidden border',
        imageSizeClass,
      )}
    >
      <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
    </div>
  ) : (
    <div
      className={cn(
        'rounded-apple-md border-apple-hairline/80 bg-apple-surface-pearl text-apple-ink-muted-48 flex shrink-0 items-center justify-center border',
        imageSizeClass,
      )}
    >
      <ImageOff className="size-6 opacity-40" />
    </div>
  )

  const titleElement = (
    <h4 className="text-apple-ink hover:text-apple-primary line-clamp-2 text-[13px] leading-tight font-semibold tracking-[-0.1px] transition-colors">
      {title}
    </h4>
  )

  const renderProductLink = (children: React.ReactNode, className?: string) => {
    if (!productHandleOrId) return children
    const link = (
      <Link href={`/product/${productHandleOrId}`} className={className}>
        {children}
      </Link>
    )
    return isSheet ? <SheetClose asChild>{link}</SheetClose> : link
  }

  return (
    <li className="list-none">
      <Card className="rounded-apple-lg border-apple-hairline/80 bg-apple-canvas hover:border-apple-hairline group relative overflow-hidden border p-0 shadow-xs transition-all duration-200">
        {isPending && (
          <div className="bg-apple-canvas/60 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] transition-all duration-200">
            <Loader2 className="text-apple-primary size-5 animate-spin" />
          </div>
        )}
        <CardContent className={cn('p-3.5', isSheet ? 'p-3' : 'p-4 max-sm:p-3')}>
          <div className="flex items-start gap-3.5 max-sm:gap-3">
            {renderProductLink(imageElement, 'shrink-0')}

            <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
              {/* Header row: Title, variants, unit price & remove button */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {renderProductLink(titleElement)}

                  {variantDetails.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {variantDetails.map((detail, idx) => (
                        <span
                          key={idx}
                          className="bg-apple-canvas-parchment border-apple-hairline/60 text-apple-ink-muted-80 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight"
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
                  title="Удалить товар"
                  className="text-apple-ink-muted-48 size-7 shrink-0 cursor-pointer rounded-full transition-colors hover:bg-rose-500/10 hover:text-rose-600 active:scale-95"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              {/* Bottom row: Pill Stepper & Line Total Price */}
              <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                {/* Modern Pill Stepper */}
                <div className="bg-apple-canvas-parchment border-apple-hairline/80 inline-flex items-center rounded-full border p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={isPending}
                    aria-label="Уменьшить количество"
                    className="bg-apple-canvas text-apple-ink hover:text-apple-primary flex size-6 cursor-pointer items-center justify-center rounded-full shadow-2xs transition-all active:scale-90 disabled:opacity-40"
                  >
                    <Minus className="size-3" strokeWidth={2.5} />
                  </button>
                  <span className="text-apple-ink min-w-[24px] px-1 text-center text-xs font-bold tracking-tight select-none">
                    {localQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={isPending}
                    aria-label="Увеличить количество"
                    className="bg-apple-canvas text-apple-ink hover:text-apple-primary flex size-6 cursor-pointer items-center justify-center rounded-full shadow-2xs transition-all active:scale-90 disabled:opacity-40"
                  >
                    <Plus className="size-3" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Line total */}
                <div className="relative text-right">
                  <span className="text-apple-ink font-heading text-[15px] font-bold tracking-[-0.2px]">
                    {formatPrice(priceTotal, 'TMT', locale)}
                  </span>

                  {localQuantity > 1 && (
                    <p className="text-apple-ink-muted-48 absolute -top-[75%] right-0 w-full text-[11px] font-medium text-nowrap">
                      {unitPrice} x {localQuantity} =
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-apple-lg border-apple-hairline bg-apple-canvas max-w-[380px] p-6 shadow-xl max-sm:p-5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-apple-ink font-heading text-lg font-bold tracking-[-0.3px]">
              Удалить товар?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-apple-ink-muted-48 text-[13px] leading-relaxed">
              Вы действительно хотите удалить <br />
              <span className="text-apple-ink font-semibold">«{title}»</span> из корзины?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex-row justify-end gap-2 p-2 max-sm:flex-col">
            <AlertDialogCancel
              size="sm"
              onClick={handleCancelDelete}
              disabled={isPending}
              className="border-apple-hairline hover:bg-apple-surface-pearl rounded-full font-semibold max-sm:w-full"
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              onClick={handleRemove}
              disabled={isPending}
              className="rounded-full bg-rose-600 font-semibold text-white hover:bg-rose-700 max-sm:w-full"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}
