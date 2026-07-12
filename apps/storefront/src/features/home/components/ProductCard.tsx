"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, Star, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { HttpTypes } from "@medusajs/types"

export interface ProductCardProps {
  product: HttpTypes.StoreProduct
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount)
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)

  // Extract variables from Medusa API product object
  const title = product.title ?? ""
  const image = product.thumbnail ?? product.images?.[0]?.url ?? ""
  
  const variant = product.variants?.[0]
  const amount = variant?.calculated_price?.calculated_amount ?? 0
  const originalAmount = variant?.calculated_price?.original_amount ?? null

  const price = `${formatPrice(amount)} тмт`
  const originalPrice = originalAmount ? `${formatPrice(originalAmount)} тмт` : null
  const installmentPrice = `${formatPrice(Math.round(amount / 12))} тмт/мес`

  // Gather tags/badges
  const badges: string[] = []
  if (product.collection?.title) {
    badges.push(product.collection.title.toUpperCase())
  }
  if (product.type?.value) {
    badges.push(product.type.value.toUpperCase())
  }

  // Seller / Store name (via custom vendor module link or fallback)
  const storeName = (product as any).vendor?.name ?? "Магазин"

  // Defaults
  const rating = 4.5
  const reviewsCount = 0

  return (
    <Card className="group relative flex flex-col justify-between transition-all duration-200 h-full border border-apple-hairline bg-apple-canvas rounded-apple-lg p-1">
      {/* Card Content Top wrapped in Link to Product page */}
      <Link href={`/product/${product.id}`} className="flex flex-col flex-1">
        {/* Product Image Container */}
        <div
          className="relative aspect-3/4 w-full rounded-[16px] overflow-hidden flex items-center justify-center p-2 group-hover:opacity-95 transition-opacity bg-apple-canvas-parchment"
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-apple-ink-muted-48 text-xs text-center p-4">{title}</span>
          )}

          {/* Heart/Favorite Button overlay */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-2.5 right-2.5 size-7 rounded-apple-full bg-apple-canvas/80 hover:bg-apple-canvas flex items-center justify-center border border-apple-divider-soft shadow-xs active:scale-95 transition-all cursor-pointer z-10"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isFavorite
                  ? "text-red-500 fill-red-500"
                  : "text-apple-ink-muted-80 hover:text-red-500"
              )}
            />
          </button>

          {/* Badges Overlays */}
          {badges.length > 0 && (
            <div className="absolute bottom-2.5 left-2.5 flex flex-col gap-1 max-w-[90%] z-10">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "text-[9px] font-semibold px-2 py-0.5 rounded-apple-pill tracking-wide uppercase select-none w-fit border",
                    badge === "ОРИГИНАЛ"
                      ? "bg-apple-primary/10 text-apple-primary border-apple-primary/20"
                      : "bg-apple-canvas text-apple-ink border-apple-hairline"
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Product Details inside CardContent */}
        <CardContent className="flex flex-col mt-2.5 px-1">
          {/* Store / Vendor Name */}
          <div className="text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wide">
            {storeName}
          </div>

          {/* Pricing row */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[16px] font-bold text-apple-ink font-sans">
              {price}
            </span>
            {originalPrice && (
              <span className="text-[13px] text-apple-ink-muted-48 line-through font-sans">
                {originalPrice}
              </span>
            )}
          </div>

          {/* Installment Badge */}
          <div className="mt-1.5">
            <span className="bg-apple-canvas-parchment text-apple-ink-muted-80 text-[11px] font-semibold px-2 py-0.5 rounded-apple-sm border border-apple-hairline font-sans inline-block">
              {installmentPrice}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-[13px] text-apple-ink leading-tight mt-2 font-text line-clamp-2 min-h-[32px] group-hover:text-apple-primary transition-colors">
            {title}
          </h3>

          {/* Rating and Reviews Row */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-apple-ink-muted-48">
            <Star className="size-3.5 fill-amber-400 stroke-amber-400" strokeWidth={0} />
            <span className="font-semibold text-apple-ink font-sans">{rating}</span>
            <span className="font-sans">({reviewsCount} отзывов)</span>
          </div>
        </CardContent>
      </Link>

      {/* Cart Add Button inside CardFooter */}
      <CardFooter className="mt-3 p-0 pb-2 border-t-0 bg-transparent rounded-none">
        <Button
          variant="default"
          size="sm"
          className="w-full font-semibold cursor-pointer"
        >
          <ShoppingBag className="size-4" />
          <span>Завтра</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
