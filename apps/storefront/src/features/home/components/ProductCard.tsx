'use client'

import * as React from 'react'

import Link from 'next/link'

import type { HttpTypes } from '@medusajs/types'
import { Check, Heart, ShoppingBag, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useAddLineItem } from '@/features/cart/api/queries'
import { getCartId } from '@/lib/cart-cookies'
import { cn } from '@/lib/utils'

export interface ProductCardProps {
  product: HttpTypes.StoreProduct
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU').format(amount)
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)

  // Extract variables from Medusa API product object
  const title = product.title ?? ''
  const image = product.thumbnail ?? product.images?.[0]?.url ?? ''

  const variant = product.variants?.[0]
  const amount = variant?.calculated_price?.calculated_amount ?? 0
  const originalAmount = variant?.calculated_price?.original_amount ?? null

  const price = `${formatPrice(amount)} тмт`
  const originalPrice = originalAmount ? `${formatPrice(originalAmount)} тмт` : null

  // Gather tags/badges
  const badges: string[] = []
  if (product.collection?.title) {
    badges.push(product.collection.title.toUpperCase())
  }
  if (product.type?.value) {
    badges.push(product.type.value.toUpperCase())
  }

  const rating = 4.5
  const reviewsCount = 0

  return (
    <Card className="group border-apple-hairline bg-apple-canvas rounded-apple-lg relative flex h-full flex-col justify-between border p-1 transition-all duration-200">
      {/* Card Content Top wrapped in Link to Product page */}
      <Link href={`/product/${product.id}`} className="flex flex-1 flex-col">
        {/* Product Image Container */}
        <div className="bg-apple-canvas-parchment relative flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-[16px] p-2 transition-all duration-200 ease-in-out group-hover:opacity-95 hover:scale-104 hover:rounded-none">
          <img src={image} alt={title} className="h-full w-full object-cover" />

          {/* Heart/Favorite Button overlay */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsFavorite(!isFavorite)
            }}
            className="rounded-apple-full bg-apple-canvas/80 hover:bg-apple-canvas border-apple-divider-soft absolute top-2.5 right-2.5 z-10 flex size-7 cursor-pointer items-center justify-center border shadow-xs transition-all active:scale-95"
          >
            <Heart
              className={cn(
                'size-4 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-apple-ink-muted-80 hover:text-red-500',
              )}
            />
          </button>

          {/* Badges Overlays */}
          {badges.length > 0 && (
            <div className="absolute bottom-2.5 left-2.5 z-10 flex max-w-[90%] flex-col gap-1">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'rounded-apple-pill w-fit border px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase select-none',
                    badge === 'ОРИГИНАЛ'
                      ? 'bg-apple-primary/10 text-apple-primary border-apple-primary/20'
                      : 'bg-apple-canvas text-apple-ink border-apple-hairline',
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Product Details inside CardContent */}
        <CardContent className="mt-2.5 flex flex-col px-1">
          {/* Store / Vendor Name */}
          <div className="text-apple-ink-muted-48 text-[11px] font-semibold tracking-wide uppercase">{'storeName'}</div>

          {/* Pricing row */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-apple-ink font-sans text-[16px] font-bold">{price}</span>
            {originalPrice && (
              <span className="text-apple-ink-muted-48 font-sans text-[13px] line-through">{originalPrice}</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-apple-ink font-text group-hover:text-apple-primary mt-2 line-clamp-2 min-h-[32px] text-[13px] leading-tight transition-colors">
            {title}
          </h3>

          {/* Rating and Reviews Row */}
          <div className="text-apple-ink-muted-48 mt-1 flex items-center gap-1 text-[11px]">
            <Star className="size-3.5 fill-amber-400 stroke-amber-400" strokeWidth={0} />
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
  const [state, setState] = React.useState<'idle' | 'added'>('idle')
  const addToCart = useAddLineItem()

  const variant = product.variants?.[0]
  const variantId = variant?.id

  const handleAdd = () => {
    if (!variantId) return
    const cartId = getCartId()
    addToCart.mutate(
      {
        cartId: cartId ?? '',
        payload: {
          quantity: 1,
          variant_id: variantId,
          title: product.title,
          thumbnail: product.thumbnail ?? product.images?.[0]?.url,
        },
      },
      {
        onSuccess: () => {
          setState('added')
          setTimeout(() => setState('idle'), 2000)
        },
      },
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleAdd}
      disabled={addToCart.isPending || !variantId}
      className="w-full cursor-pointer font-semibold disabled:opacity-60"
    >
      {state === 'added' ? (
        <>
          <Check className="size-4" />
          <span>В корзине</span>
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" />
          <span>Завтра</span>
        </>
      )}
    </Button>
  )
}
