'use client'

/* eslint-disable @next/next/no-img-element -- Product and vendor media are dynamic MinIO URLs. */
import * as React from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Check, Heart, Info, MapPin, Package, ShoppingBag } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAddLineItem } from '@/features/cart/api/queries'
import { useProduct, useProductVendor } from '@/features/product/api/queries'
import { ProductShareButton } from '@/features/product/components/ProductShareButton'
import { ProductReviews } from '@/features/reviews/components/ProductReviews'
import { StoreReviews } from '@/features/store-reviews/components/StoreReviews'
import { getCartId } from '@/lib/cart-cookies'
import { cn } from '@/lib/utils'

type ProductOptionSelection = Record<string, string>

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount)
}

export function ProductDetailClient() {
  const params = useParams()
  const handleOrId = Array.isArray(params?.id) ? params.id[0] : params?.id || ''
  const { data: product, isLoading, isError } = useProduct(handleOrId)
  const { data: vendor } = useProductVendor(handleOrId)

  const [activeImageIdx, setActiveImageIdx] = React.useState(0)
  const [selectedOptions, setSelectedOptions] = React.useState<ProductOptionSelection>({})
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [cartState, setCartState] = React.useState<'idle' | 'added'>('idle')
  const addToCart = useAddLineItem()

  if (isLoading) {
    return <main className="bg-apple-canvas text-apple-ink mx-auto min-h-screen max-w-[1240px] px-4 py-6" />
  }

  if (isError || !product) {
    return (
      <main className="bg-apple-canvas text-apple-ink mx-auto flex min-h-screen max-w-[1240px] items-center justify-center px-4 py-6">
        <p className="text-apple-ink-muted-80 text-sm">Товар не найден или больше недоступен.</p>
      </main>
    )
  }

  const imageUrls = (product.images ?? []).map((image) => image.url)
  if (imageUrls.length === 0 && product.thumbnail) imageUrls.push(product.thumbnail)
  const selectedImageIndex = imageUrls.length > 0 ? Math.min(activeImageIdx, imageUrls.length - 1) : 0

  const defaultSelectedOptions = Object.fromEntries(
    (product.options ?? []).flatMap((option) => {
      const value = option.values?.[0]?.value
      return option.id && value ? [[option.id, value]] : []
    }),
  )
  const resolvedSelectedOptions = { ...defaultSelectedOptions, ...selectedOptions }

  const selectedVariant = product.variants?.find((variant) =>
    (product.options ?? []).every((option) =>
      variant.options?.some(
        (variantOption) =>
          variantOption.option?.id === option.id && variantOption.value === resolvedSelectedOptions[option.id],
      ),
    ),
  )

  const selectedPrice = selectedVariant?.prices?.[0]
  const stockQuantity =
    selectedVariant && typeof selectedVariant.inventory_quantity === 'number'
      ? selectedVariant.inventory_quantity
      : null

  const isOutOfStock = Boolean(selectedVariant && stockQuantity !== null && stockQuantity <= 0)
  const isCombinationUnavailable = !selectedVariant

  const specifications = [
    ['Материал', product.material],
    ['Страна происхождения', product.origin_country],
    ['Вес', product.weight ? `${product.weight} г` : null],
    [
      'Размеры',
      product.length && product.width && product.height
        ? `${product.length} × ${product.width} × ${product.height}`
        : null,
    ],
    ['Артикул товара', selectedVariant?.sku],
  ].filter((specification): specification is [string, string] => Boolean(specification[1]))

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return

    addToCart.mutate(
      {
        cartId: getCartId() ?? '',
        payload: {
          variant_id: selectedVariant.id,
          quantity: 1,
          title: product.title,
          thumbnail: product.thumbnail ?? undefined,
        },
      },
      {
        onSuccess: () => {
          setCartState('added')
          setTimeout(() => setCartState('idle'), 2000)
        },
      },
    )
  }

  const storeName = vendor?.store_name || vendor?.name

  return (
    <main className="custom-container bg-apple-canvas text-apple-ink mx-auto min-h-screen px-4 py-6 antialiased select-none">
      <div className="border-apple-divider-soft mb-6 flex flex-col justify-between gap-4 border-b py-3 text-[13px] md:flex-row md:items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {(product.categories ?? []).map((category) => (
              <React.Fragment key={category.id}>
                <BreadcrumbItem>
                  <BreadcrumbPage>{category.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-apple-ink-muted-80 flex items-center gap-6 font-medium">
          {selectedVariant?.sku && (
            <span className="text-apple-ink-muted-48 select-text">Артикул: {selectedVariant.sku}</span>
          )}
          <ProductShareButton />
        </div>
      </div>

      <div className="relative grid items-start gap-8 lg:grid-cols-12">
        <div className="sticky flex gap-4 lg:col-span-5">
          {imageUrls.length > 1 && (
            <div className="flex shrink-0 flex-col gap-2">
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  onClick={() => setActiveImageIdx(index)}
                  aria-label={`Изображение товара ${index + 1}`}
                  className={cn(
                    'rounded-apple-sm bg-apple-canvas-parchment relative size-14 cursor-pointer overflow-hidden border transition-all duration-100 active:scale-95',
                    activeImageIdx === index
                      ? 'border-apple-primary ring-apple-primary ring-1'
                      : 'border-apple-hairline hover:border-apple-ink-muted-48',
                  )}
                >
                  <img src={imageUrl} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="rounded-apple-lg border-apple-hairline bg-apple-canvas-parchment relative flex aspect-[3/4] flex-1 items-center justify-center overflow-hidden border shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0]">
            {imageUrls[selectedImageIndex] ? (
              <img src={imageUrls[selectedImageIndex]} alt={product.title} className="size-full object-contain" />
            ) : (
              <Package className="text-apple-ink-muted-48 size-12" aria-label="Изображение товара отсутствует" />
            )}
            {imageUrls.length > 1 && (
              <div className="rounded-apple-pill absolute right-3 bottom-3 bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-xs">
                {selectedImageIndex + 1} / {imageUrls.length}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:col-span-4">
          <h1 className="font-heading text-apple-ink mb-6 text-[24px] leading-tight font-semibold tracking-tight">
            {product.title}
          </h1>

          {(product.options ?? []).length > 0 && (
            <div className="mb-8 space-y-5">
              {(product.options ?? []).map((option) => (
                <div key={option.id}>
                  <div className="text-apple-ink-muted-48 mb-3 flex items-center gap-1 text-[13px] font-medium">
                    <span className="first-letter:uppercase">{option.title}:</span>
                    <span className="text-apple-ink font-semibold">{resolvedSelectedOptions[option.id]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {(option.values ?? []).map((value) => {
                      const isSelected = resolvedSelectedOptions[option.id] === value.value

                      const candidateOptions = { ...resolvedSelectedOptions, [option.id]: value.value }
                      const candidateVariant = product.variants?.find((variant) =>
                        (product.options ?? []).every((opt) =>
                          variant.options?.some(
                            (vo) => vo.option?.id === opt.id && vo.value === candidateOptions[opt.id],
                          ),
                        ),
                      )

                      const variantExists = Boolean(candidateVariant)
                      const candidateStock =
                        candidateVariant && typeof candidateVariant.inventory_quantity === 'number'
                          ? candidateVariant.inventory_quantity
                          : null
                      const isCandidateOutOfStock = Boolean(
                        candidateVariant && candidateStock !== null && candidateStock <= 0,
                      )

                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => setSelectedOptions((current) => ({ ...current, [option.id]: value.value }))}
                          title={
                            !variantExists
                              ? 'Данная комбинация недоступна'
                              : isCandidateOutOfStock
                                ? 'Нет в наличии'
                                : undefined
                          }
                          className={cn(
                            'rounded-apple-pill relative min-w-[56px] cursor-pointer px-4 py-2 text-center text-[14px] font-semibold transition-all duration-100 active:scale-95',
                            isSelected
                              ? 'bg-apple-canvas text-apple-ink ring-apple-primary-focus ring-2'
                              : !variantExists
                                ? 'bg-apple-canvas-parchment text-apple-ink-muted-48 border-apple-hairline border border-dashed line-through opacity-50'
                                : isCandidateOutOfStock
                                  ? 'bg-apple-canvas text-apple-ink-muted-48 border-apple-hairline border line-through opacity-70'
                                  : 'bg-apple-canvas text-apple-ink-muted-80 border-apple-hairline hover:border-apple-ink-muted-48 border',
                          )}
                        >
                          {value.value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {specifications.length > 0 && (
            <div className="pt-2">
              <Separator className="bg-apple-divider-soft mb-6" />
              <h2 className="font-heading text-apple-ink mb-4 text-[16px] font-semibold">О товаре</h2>
              <div className="space-y-3.5">
                {specifications.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 text-[13px]">
                    <div className="text-apple-ink-muted-48 flex flex-1 items-baseline">
                      <span className="bg-apple-canvas z-10 shrink-0 pr-1.5">{label}</span>
                      <span className="border-apple-hairline h-[2px] flex-1 -translate-y-1 border-b border-dotted" />
                    </div>
                    <div className="text-apple-ink max-w-[50%] shrink-0 text-right font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <Card className="rounded-apple-lg border-apple-hairline overflow-hidden border shadow-none">
            <CardContent className="p-5">
              {selectedPrice ? (
                <div className="mb-5 flex items-baseline gap-2">
                  <span className="text-apple-ink font-sans text-[28px] font-semibold tracking-tight">
                    {formatPrice(selectedPrice.amount, selectedPrice.currency_code)}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-apple-ink-muted-48 hover:text-apple-ink cursor-pointer transition-colors"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <p>Цена выбранного варианта</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="mb-5">
                  <span className="text-apple-ink-muted-48 text-[15px] font-medium">Комбинация недоступна</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isCombinationUnavailable || isOutOfStock || addToCart.isPending}
                  variant="default"
                  className="relative flex h-12 flex-1 cursor-pointer items-center justify-center py-2 leading-tight font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5">
                    {cartState === 'added' ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                    <span>
                      {cartState === 'added'
                        ? 'В корзине'
                        : addToCart.isPending
                          ? 'Добавляем'
                          : isCombinationUnavailable
                            ? 'Комбинация недоступна'
                            : isOutOfStock
                              ? 'Нет в наличии'
                              : 'В корзину'}
                    </span>
                  </div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsFavorite((value) => !value)}
                  variant="pearl"
                  size="icon-lg"
                  className="border-apple-divider-soft flex size-12 shrink-0 cursor-pointer items-center justify-center border"
                >
                  <Heart
                    className={cn(
                      'size-5 transition-colors',
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-apple-ink-muted-80',
                    )}
                  />
                </Button>
              </div>
            </CardContent>
          </Card>

          {(isCombinationUnavailable || stockQuantity !== null || vendor?.city) && (
            <Card className="rounded-apple-lg border-apple-hairline overflow-hidden border shadow-none">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-heading text-apple-ink text-[14px] font-semibold">Наличие и доставка</h3>
                </div>
                <Separator className="bg-apple-divider-soft" />
                {vendor?.city && (
                  <div className="flex items-start gap-2.5 text-[13px]">
                    <MapPin className="text-apple-ink-muted-48 mt-0.5 size-4 shrink-0" />
                    <div className="flex flex-1 flex-col leading-snug">
                      <span className="text-apple-ink font-semibold">Отправка из {vendor.city}</span>
                      {vendor.address && (
                        <span className="text-apple-ink-muted-48 mt-0.5 text-[11px]">{vendor.address}</span>
                      )}
                    </div>
                  </div>
                )}
                {isCombinationUnavailable ? (
                  <div className="rounded-apple-sm flex items-center gap-2 border border-amber-200 bg-amber-50/60 p-2.5 text-[13px] leading-snug font-semibold text-amber-800">
                    <Info className="size-4 shrink-0 text-amber-600" />
                    <span>Такая комбинация параметров не существует</span>
                  </div>
                ) : stockQuantity !== null ? (
                  <div
                    className={cn(
                      'rounded-apple-sm flex items-center gap-1.5 border p-2 text-[13px] leading-snug font-semibold',
                      stockQuantity > 0
                        ? 'border-emerald-100 bg-emerald-50/50 text-emerald-600'
                        : 'border-rose-100 bg-rose-50/50 text-rose-500',
                    )}
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        stockQuantity > 0 ? 'bg-emerald-500' : 'animate-pulse bg-rose-500',
                      )}
                    />
                    <span>{stockQuantity > 0 ? `В наличии — ${stockQuantity} шт.` : 'Нет в наличии'}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {vendor && storeName && (
            <Card className="rounded-apple-lg border-apple-hairline overflow-hidden border shadow-none">
              <CardContent className="space-y-3.5 p-4">
                <div className="text-apple-ink-muted-48 text-[11px] font-bold tracking-wider uppercase">Магазин</div>
                <div className="flex items-center gap-3">
                  <div className="bg-apple-canvas-parchment text-apple-ink rounded-apple-full border-apple-hairline flex size-10 shrink-0 items-center justify-center overflow-hidden border text-[16px] font-bold">
                    {vendor.logo ? (
                      <img src={vendor.logo} alt="" className="size-full object-cover" />
                    ) : (
                      storeName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-[14px] font-semibold">{storeName}</div>
                    {vendor.store_description && (
                      <p className="text-apple-ink-muted-48 mt-0.5 line-clamp-2 text-[12px]">
                        {vendor.store_description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ProductReviews productId={product.id} />
      {vendor && storeName && <StoreReviews key={vendor.id} vendorId={vendor.id} storeName={storeName} />}
    </main>
  )
}
