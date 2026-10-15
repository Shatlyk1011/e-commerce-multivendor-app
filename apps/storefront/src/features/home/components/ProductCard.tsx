'use client'

import * as React from 'react'

import Link from 'next/link'

import type { HttpTypes } from '@medusajs/types'
import { Check, Heart, Loader, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

import { useI18n } from '@/components/providers/I18nProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  useCreateCustomerFavorite,
  useCustomerFavorites,
  useDeleteCustomerFavorite,
} from '@/features/account/api/queries'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { useAddLineItem } from '@/features/cart/api/queries'
import { type Locale, intlLocale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type ProductWithVendor = HttpTypes.StoreProduct & {
  vendor?: {
    name?: string | null
    store_name?: string | null
  } | null
}

export interface ProductCardProps {
  product: ProductWithVendor
}

function formatPrice(amount: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale(locale)).format(amount)
}

export function ProductCard({ product }: ProductCardProps) {
  const { locale, t } = useI18n()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
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

  const price = typeof amount === 'number' ? `${formatPrice(amount, locale)} тмт` : 'Цена уточняется'
  const originalPrice =
    typeof amount === 'number' && typeof originalAmount === 'number' && originalAmount > amount
      ? `${formatPrice(originalAmount, locale)} тмт`
      : null

  const storeName = product.vendor?.store_name || product.vendor?.name || 'Магазин'

  return (
    <Card className="group border-apple-hairline/40 bg-apple-canvas rounded-apple-lg relative flex h-full min-w-0 flex-col justify-between gap-0 border p-1 transition-all duration-200">
      {/* Card Content Top wrapped in Link to Product page */}
      <Link href={`/product/${product.handle || product.id}`} className="flex min-w-0 flex-1 flex-col">
        {/* Product Image Container */}
        <div className="bg-apple-canvas-parchment relative flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-[16px] transition-all duration-200 ease-in-out lg:group-hover:opacity-95 lg:hover:scale-104 lg:hover:rounded-none">
          <img src={image} alt={title} className="h-full w-full object-cover" />

          {/* Heart/Favorite Button overlay */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!isAuthenticated) {
                toast.error(t('Войдите в аккаунт, чтобы добавить товар в избранное.'))
                return
              }
              if (isFavorite && favorite) {
                deleteFavorite.mutate(favorite.id)
              } else {
                createFavorite.mutate(product.id)
              }
            }}
            type="button"
            disabled={isAuthLoading || isFavoritePending}
            aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            className="rounded-apple-full bg-apple-canvas/80 group/link hover:bg-apple-canvas border-apple-divider-soft absolute top-1 right-1 z-10 flex size-9 cursor-pointer items-center justify-center border shadow-xs transition-all active:scale-95 sm:top-2.5 sm:right-2.5"
          >
            <Heart
              className={cn(
                'size-4 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-apple-ink-muted-80 group-hover/link:text-red-500',
              )}
            />
          </button>
        </div>

        {/* Product Details inside CardContent */}
        <CardContent className="mt-2.5 flex min-w-0 flex-col px-1 pb-0">
          {/* Pricing row */}
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-apple-ink font-sans text-[15px] font-bold sm:text-[16px]">{price}</span>
            {originalPrice && (
              <span className="text-apple-ink-muted-48 font-sans text-[13px] line-through">{originalPrice}</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-apple-ink font-text group-hover:text-apple-primary mt-2 line-clamp-2 min-h-[32px] text-[13px] leading-tight font-medium transition-colors">
            {title}
          </h3>

          <p className="text-apple-ink-muted-48 mt-1 truncate text-[11px]" title={storeName}>
            {storeName}
          </p>
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

function isVariantAvailable(variant: HttpTypes.StoreProductVariant) {
  return (
    Boolean(variant.id) &&
    (variant.manage_inventory === false || variant.allow_backorder === true || (variant.inventory_quantity ?? 0) > 0)
  )
}

function AddToCartButton({ product }: AddToCartButtonProps) {
  const [state, setState] = React.useState<'idle' | 'pending' | 'added'>('idle')
  const { mutateAsync: handleAddItem, isPending } = useAddLineItem()

  const variants = product.variants ?? []
  const targetVariant = variants.find(isVariantAvailable)
  const isAvailable = Boolean(targetVariant?.id)

  const handleAdd = async () => {
    if (!targetVariant?.id) return
    setState('pending')

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
      disabled={isPending || !isAvailable || state === 'pending'}
      className="h-11 w-full cursor-pointer gap-1 px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:gap-1.5 sm:px-[15px] sm:text-[14px]"
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
          <span>{isAvailable ? 'Завтра' : 'Нет в наличии'}</span>
        </>
      )}
    </Button>
  )
}
