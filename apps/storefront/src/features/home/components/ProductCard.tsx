'use client'

import * as React from 'react'

import Link from 'next/link'

import type { HttpTypes } from '@medusajs/types'
import { Check, Heart, Loader, ShoppingBag, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  useCreateCustomerFavorite,
  useCustomerFavorites,
  useDeleteCustomerFavorite,
} from '@/features/account/api/queries'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useAddLineItem } from '@/features/cart/api/queries'
import type { ReviewSummary } from '@/features/reviews/api/client'
import { cn } from '@/lib/utils'

export interface ProductCardProps {
  product: HttpTypes.StoreProduct
  reviewSummary?: ReviewSummary
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU').format(amount)
}

export function ProductCard({ product, reviewSummary }: ProductCardProps) {
  const { isAuthenticated } = useAuth()
  const { data: favorites = [] } = useCustomerFavorites(isAuthenticated)
  const createFavorite = useCreateCustomerFavorite()
  const deleteFavorite = useDeleteCustomerFavorite()
  const favorite = favorites.find((item) => item.product.id === product.id)
  const isFavorite = Boolean(favorite)
  const isFavoritePending = createFavorite.isPending || deleteFavorite.isPending

  // Extract variables from Medusa API product object
  const title = product.title ?? ''
  const image = product.thumbnail ?? ''

  const variant = product.variants?.find((v) => v.calculated_price?.calculated_amount != null) ?? product.variants?.[0]
  const amount = variant?.calculated_price?.calculated_amount
  const originalAmount = variant?.calculated_price?.original_amount ?? null

  const price = typeof amount === 'number' ? `${formatPrice(amount)} тмт` : 'Цена уточняется'
  const originalPrice =
    typeof amount === 'number' && typeof originalAmount === 'number' && originalAmount > amount
      ? `${formatPrice(originalAmount)} тмт`
      : null

  const rating = reviewSummary?.average_rating
  const reviewsCount = reviewSummary?.review_count ?? 0

  return (
    <Card className="group border-apple-hairline/40 bg-apple-canvas rounded-apple-lg relative flex h-full flex-col justify-between gap-0 border p-1 transition-all duration-200">
      {/* Card Content Top wrapped in Link to Product page */}
      <Link href={`/product/${product.handle || product.id}`} className="flex flex-1 flex-col">
        {/* Product Image Container */}
        <div className="bg-apple-canvas-parchment relative flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-[16px] transition-all duration-200 ease-in-out group-hover:opacity-95 hover:scale-104 hover:rounded-none">
          <img src={image} alt={title} className="h-full w-full object-cover" />

          {/* Heart/Favorite Button overlay */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (isFavorite && favorite) {
                deleteFavorite.mutate(favorite.id)
              } else {
                createFavorite.mutate(product.id)
              }
            }}
            type="button"
            disabled={isFavoritePending}
            aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            className="rounded-apple-full bg-apple-canvas/80 hover:bg-apple-canvas border-apple-divider-soft absolute top-2.5 right-2.5 z-10 flex size-6 cursor-pointer items-center justify-center border shadow-xs transition-all active:scale-95"
          >
            <Heart
              className={cn(
                'size-3.5 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-apple-ink-muted-80 hover:text-red-500',
              )}
            />
          </button>
        </div>

        {/* Product Details inside CardContent */}
        <CardContent className="mt-2.5 flex flex-col px-1 pb-0">
          {/* Pricing row */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-apple-ink font-sans text-[16px] font-bold">{price}</span>
            {originalPrice && (
              <span className="text-apple-ink-muted-48 font-sans text-[13px] line-through">{originalPrice}</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-apple-ink font-text group-hover:text-apple-primary mt-2 line-clamp-2 min-h-[32px] text-[13px] leading-tight font-medium transition-colors">
            {title}
          </h3>

          {/* Rating and Reviews Row */}
          <div
            className="text-apple-ink-muted-48 mt-1 flex items-center gap-1 text-[11px]"
            aria-label={`Оценка ${rating} из 5 на основе ${reviewsCount} отзывов`}
          >
            <Star className="size-3.5 fill-amber-400 stroke-amber-400" strokeWidth={0} aria-hidden="true" />
            <span className="text-apple-ink font-sans font-semibold">{rating}</span>
            <span className="font-sans">({reviewsCount} отзывов)</span>
          </div>
        </CardContent>
      </Link>

      {/* Cart Add Button inside CardFooter */}
      <CardFooter className="mt-3 rounded-none border-t-0 bg-transparent p-0 pb-2">
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  )
}

interface AddToCartButtonProps {
  product: HttpTypes.StoreProduct
}

function AddToCartButton({ product }: AddToCartButtonProps) {
  const [state, setState] = React.useState<'idle' | 'pending' | 'added'>('idle')
  const { mutateAsync: handleAddItem, isPending } = useAddLineItem()

  const variants = product.variants ?? []
  const hasVariant = variants.some((v) => Boolean(v.id))

  const handleAdd = async () => {
    if (!hasVariant) return
    setState('pending')

    const targetVariant =
      variants.find(
        (v) =>
          Boolean(v.id) &&
          (v.inventory_quantity === undefined || v.inventory_quantity === null || v.inventory_quantity > 0),
      ) || variants.find((v) => Boolean(v.id))

    if (!targetVariant?.id) {
      setState('idle')
      return
    }

    try {
      await handleAddItem({
        payload: {
          quantity: 1,
          variant_id: targetVariant.id,
          title: product.title,
          thumbnail: product.thumbnail ?? product.images?.[0]?.url,
        },
      })
      setState('added')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleAdd}
      disabled={isPending || !hasVariant || state === 'pending'}
      className="w-full cursor-pointer font-semibold disabled:opacity-60"
    >
      {state === 'pending' && (
        <>
          <Loader className="size-4 animate-spin" />
          <span>Добавляем...</span>
        </>
      )}
      {state === 'added' && (
        <>
          <Check className="size-4" />
          <span>В корзине</span>
        </>
      )}
      {state === 'idle' && (
        <>
          <ShoppingBag className="size-4" />
          <span>Завтра</span>
        </>
      )}
    </Button>
  )
}
