'use client'

import * as React from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  Check,
  ChevronRight,
  Crown,
  GitCompare,
  Heart,
  Info,
  MapPin,
  MessageCircle,
  MessageSquare,
  Play,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAddLineItem } from '@/features/cart/api/queries'
import { getCartId } from '@/lib/cart-cookies'
import { cn } from '@/lib/utils'

import { PRODUCT_DATABASE, ProductDetail } from './data'

// Predefined detailed mock database. If user accesses /product/1 or similar, they see the corresponding detailed info.

// Fallback product structure in case of any arbitrary ID
const DEFAULT_PRODUCT: ProductDetail = PRODUCT_DATABASE['3060163799']

export default function ProductDetailPage() {
  const params = useParams()
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id || ''

  // Lookup product in database or fallback
  const product = PRODUCT_DATABASE[idStr] || {
    ...DEFAULT_PRODUCT,
    id: idStr || DEFAULT_PRODUCT.id,
  }

  // State Management
  const [activeImageIdx, setActiveImageIdx] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState(product.options[1] || product.options[0] || '')
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [cartState, setCartState] = React.useState<'idle' | 'added'>('idle')
  const [compareState, setCompareState] = React.useState(false)

  const addToCart = useAddLineItem()

  // Handlers
  const handleAddToCart = () => {
    const cartId = getCartId()
    // variant_id would come from real product API data; mock products use id as placeholder
    const variantId = (product as { variant_id?: string }).variant_id ?? product.id
    addToCart.mutate(
      {
        cartId: cartId ?? '',
        payload: {
          variant_id: variantId,
          quantity: 1,
          title: product.title,
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

  // Predefined grey placeholders mapping for product images (6 angles/variants)
  const MOCK_GALLERY = [
    {
      title: 'Front View',
      description: 'Frontal display layout',
      overlay: (
        <div className="text-apple-ink absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="font-heading text-apple-ink mb-1 text-[28px] font-semibold tracking-tight">
            {product.brand} {selectedOption}
          </div>
          <div className="text-apple-ink-muted-48 mb-6 text-[13px] font-semibold tracking-widest uppercase">
            Встроенные динамики
          </div>
          <div className="bg-apple-hairline mb-6 h-px w-[80%]"></div>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" size="default" className="font-bold shadow-xs">
              FHD
            </Badge>
            <Badge variant="outline" size="default" className="font-bold shadow-xs">
              120Hz
            </Badge>
            <Badge variant="outline" size="default" className="font-bold shadow-xs">
              IPS
            </Badge>
          </div>
          <div className="text-apple-ink-muted-48 mt-12 text-[11px] font-semibold">[ Интерактивный серый макет ]</div>
        </div>
      ),
    },
    {
      title: 'Side View',
      description: 'Ultra-slim 7.9mm side perspective',
      overlay: (
        <div className="text-apple-ink absolute inset-0 flex flex-col items-center justify-center p-6 select-none">
          <div className="bg-apple-ink/90 relative flex h-64 w-4 items-center justify-center rounded-full shadow-lg">
            <div className="text-apple-ink-muted-48 absolute -left-12 text-[12px] font-semibold">7.9 mm</div>
          </div>
          <div className="mt-6 text-[14px] font-semibold">Угол наклона -5° до +20°</div>
          <div className="text-apple-ink-muted-48 mt-1 text-[12px]">Регулируемая эргономичная подставка</div>
        </div>
      ),
    },
    {
      title: 'Back Ports',
      description: 'HDMI, DisplayPort and DC inputs',
      overlay: (
        <div className="text-apple-ink absolute inset-0 flex flex-col items-center justify-center p-6 select-none">
          <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg grid grid-cols-3 gap-6 border p-4 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="mb-1 h-4 w-8 rounded-xs bg-neutral-400"></span>
              <span className="text-apple-ink-muted-80 text-[10px] font-semibold">HDMI 1.4</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1 h-4 w-8 rounded-xs bg-neutral-400"></span>
              <span className="text-apple-ink-muted-80 text-[10px] font-semibold">DP 1.2</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1 h-5 w-5 rounded-full bg-neutral-400"></span>
              <span className="text-apple-ink-muted-80 text-[10px] font-semibold">Audio Out</span>
            </div>
          </div>
          <div className="mt-6 text-center text-[13px] font-semibold">Поддержка VESA 75x75 мм</div>
          <div className="text-apple-ink-muted-48 mt-1 text-center text-[12px]">Слот замка безопасности Kensington</div>
        </div>
      ),
    },
    {
      title: 'Color Gamut',
      description: 'Color accuracy representations',
      overlay: (
        <div className="text-apple-ink absolute inset-0 flex flex-col items-center justify-center p-6 select-none">
          <div className="border-apple-primary/40 relative flex size-36 items-center justify-center rounded-full border-4 border-dashed">
            <div className="bg-apple-canvas border-apple-hairline flex size-24 items-center justify-center rounded-full border text-[14px] font-bold">
              99% sRGB
            </div>
          </div>
          <div className="mt-6 text-[14px] font-semibold">16.7 миллионов цветов</div>
          <div className="text-apple-ink-muted-48 mt-1 text-[12px]">Идеально для работы с графикой и текстом</div>
        </div>
      ),
    },
    {
      title: 'Stand Installation',
      description: 'Toolless setup instruction details',
      overlay: (
        <div className="text-apple-ink absolute inset-0 flex flex-col items-center justify-center p-6 select-none">
          <div className="text-apple-primary mb-4 flex items-center gap-2 font-bold">
            <ShieldCheck className="size-6" />
            <span>Быстрая сборка за 1 минуту</span>
          </div>
          <div className="text-apple-ink-muted-80 max-w-[280px] text-center text-[13px] leading-relaxed">
            Вставьте ножку до щелчка. Закрутите один фиксирующий винт у основания без дополнительных инструментов.
          </div>
        </div>
      ),
    },
  ]

  return (
    <main className="bg-apple-canvas text-apple-ink mx-auto min-h-screen max-w-[1240px] px-4 py-6 antialiased select-none">
      {/* BREADCRUMB AND UTILITY ACTIONS LINE */}
      <div className="border-apple-divider-soft mb-6 flex flex-col justify-between gap-4 border-b py-3 text-[13px] md:flex-row md:items-center">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.categoryPath.map((item, index) => {
              const isLast = index === product.categoryPath.length - 1
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Top actions */}
        <div className="text-apple-ink-muted-80 flex items-center gap-6 font-medium">
          <span className="text-apple-ink-muted-48 select-text">Артикул: {product.articleNumber}</span>

          <Button variant={'ghost'} size="xs">
            <Share2 className="size-4" />
            <span>Поделиться</span>
          </Button>
        </div>
      </div>

      {/* CORE CONTENT LAYOUT */}
      <div className="relative grid items-start gap-8 lg:grid-cols-12">
        {/* COLUMN 1: PRODUCT GALLERY (5 cols) */}
        <div className="sticky flex gap-4 lg:col-span-5">
          {/* Thumbnails Sidebar */}
          <div className="flex shrink-0 flex-col gap-2">
            {MOCK_GALLERY.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  'rounded-apple-sm bg-apple-canvas-parchment relative flex size-14 cursor-pointer items-center justify-center overflow-hidden border transition-all duration-100 active:scale-95',
                  activeImageIdx === idx
                    ? 'border-apple-primary ring-apple-primary ring-1'
                    : 'border-apple-hairline hover:border-apple-ink-muted-48',
                )}
              >
                <div className="text-apple-ink-muted-48 px-0.5 text-center text-[9px] leading-tight font-bold">
                  {thumb.title.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>

          {/* Main Large Image Box with Apple-signature drop shadow */}
          <div className="rounded-apple-lg border-apple-hairline bg-apple-canvas-parchment relative aspect-[3/4] flex-1 overflow-hidden border shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0]">
            {/* Overlay contents containing styled mock layout elements */}
            {MOCK_GALLERY[activeImageIdx]?.overlay}

            {/* Bottom mini status display inside mock container */}
            <div className="rounded-apple-pill absolute right-3 bottom-3 bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-xs select-none">
              {activeImageIdx + 1} / {MOCK_GALLERY.length}
            </div>
          </div>
        </div>

        {/* COLUMN 2: PRODUCT CORE FIELDS (4 cols) */}
        <div className="flex flex-col lg:col-span-4">
          {/* Brand and Badge */}
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="primaryLight" size="pill">
              {product.brand}
            </Badge>
            {product.badges.map((badge, idx) => (
              <Badge key={idx} variant="secondary" size="default">
                {badge}
              </Badge>
            ))}
          </div>

          {/* Title - Set to display 600 weight with tight tracking */}
          <h1 className="font-heading text-apple-ink mb-3 text-[24px] leading-tight font-semibold tracking-tight">
            {product.title}
          </h1>

          {/* Rating, Reviews, Questions */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-[13px]">
            <div className="text-apple-ink flex items-center gap-1 font-semibold">
              <Star className="size-4 fill-amber-400 stroke-amber-400" strokeWidth={0} />
              <span>{product.rating}</span>
            </div>

            <span className="text-apple-ink-muted-48">•</span>

            <span className="text-apple-primary cursor-pointer font-semibold hover:underline">
              {product.reviewsCount.toLocaleString()} отзывов
            </span>

            <span className="text-apple-ink-muted-48">•</span>

            <span className="text-apple-ink-muted-80 hover:text-apple-primary flex cursor-pointer items-center gap-1 font-semibold transition-colors">
              <MessageSquare className="size-3.5" />
              {product.questionsCount} вопросов
            </span>
          </div>

          {/* Brand info details box */}
          <div className="bg-apple-surface-pearl border-apple-hairline rounded-apple-md mb-6 flex max-w-sm items-center gap-3 border p-3">
            <div className="bg-apple-ink rounded-apple-sm flex size-9 items-center justify-center text-[15px] font-bold text-white">
              {product.brand.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] leading-tight font-semibold">{product.brand}</span>
              <span className="text-apple-ink-muted-48 text-[12px]">Бренд проверен</span>
            </div>
          </div>

          {/* Configurator option chips */}
          <div className="mb-8">
            <div className="text-apple-ink-muted-48 mb-3 flex items-center gap-1 text-[13px] font-medium">
              <span>{product.optionsLabel}:</span>
              <span className="text-apple-ink font-semibold">{selectedOption}</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {product.options.map((option) => {
                const isSelected = selectedOption === option
                return (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={cn(
                      'relative min-w-[56px] cursor-pointer px-4 py-2 text-center text-[14px] font-semibold transition-all duration-100 active:scale-95',
                      isSelected
                        ? 'bg-apple-canvas text-apple-ink ring-apple-primary-focus rounded-apple-pill ring-2'
                        : 'bg-apple-canvas text-apple-ink-muted-80 border-apple-hairline hover:border-apple-ink-muted-48 rounded-apple-pill border',
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          {/* GENERAL PRODUCT SPECIFICATIONS TABLE (Quick specs preview) */}
          <div className="pt-2">
            <Separator className="bg-apple-divider-soft mb-6" />
            <h2 className="font-heading text-apple-ink mb-4 text-[16px] font-semibold">О товаре</h2>

            <div className="space-y-3.5">
              {Object.entries(product.specs)
                .slice(0, 4)
                .map(([key, val]) => (
                  <div key={key} className="flex items-baseline justify-between gap-4 text-[13px]">
                    <div className="text-apple-ink-muted-48 flex flex-1 items-baseline select-none">
                      <span className="bg-apple-canvas z-10 shrink-0 pr-1.5">{key}</span>
                      <span className="border-apple-hairline h-[2px] flex-1 -translate-y-1 border-b border-dotted"></span>
                    </div>
                    <div className="text-apple-ink max-w-[50%] shrink-0 text-right font-semibold">
                      {key === product.optionsLabel ? selectedOption : val}
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('details-tabs-section')
                el?.scrollIntoView({ behavior: 'smooth' })
                // Switch tab value programmatically if needed (currently defaulted to page navigation)
              }}
              className="text-apple-primary mt-4 flex cursor-pointer items-center gap-0.5 text-[13px] font-semibold transition-all duration-100 hover:underline active:scale-95"
            >
              <span>Все характеристики</span>
              <ChevronRight className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* COLUMN 3: SIDEBAR / PURCHASE & DELIVERY DETAILS (3 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {/* BUY BOX CARD */}
          <Card className="rounded-apple-lg border-apple-hairline overflow-hidden border shadow-none">
            <CardContent className="p-5">
              {/* Promo Banner inside Box */}
              <div className="rounded-apple-sm mb-4 flex items-center justify-between gap-1.5 border border-rose-200/50 bg-rose-50 p-2">
                <div className="flex items-center gap-1.5">
                  <Badge variant="destructive" size="xs">
                    Sale
                  </Badge>
                  <span className="text-[11px] font-bold text-rose-700">
                    {product.id === '1' ? '12 ед. осталось' : '462 ед. осталось'}
                  </span>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-rose-500">18 дн.</span>
              </div>

              {/* Price display with Info Tooltip */}
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-apple-ink font-sans text-[28px] font-semibold tracking-tight">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <div className="text-apple-ink-muted-48 flex items-center gap-1 font-sans text-[15px] font-medium select-none">
                    <span className="line-through">{product.originalPrice}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-apple-ink-muted-48 hover:text-apple-ink cursor-pointer transition-colors outline-none"
                          >
                            <Info className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p>Скидка от первоначальной цены товара</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {/* Installment simulation */}
              <div className="bg-apple-canvas-parchment border-apple-hairline rounded-apple-sm text-apple-ink-muted-80 mb-5 flex items-center justify-between border p-2 text-[12px] font-medium">
                <span>Рассрочка в месяц:</span>
                <span className="text-apple-ink font-bold">{product.installmentPrice}</span>
              </div>

              {/* Actions row */}
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  variant="default"
                  className="relative flex h-12 flex-1 cursor-pointer flex-col items-center justify-center py-2 leading-tight font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    {cartState === 'added' ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                    <span>{cartState === 'added' ? 'В корзине' : 'В корзину'}</span>
                  </div>
                  <span className="text-apple-on-primary/80 text-[9px] font-normal">Доставим 19 июля</span>
                </Button>

                <Button
                  onClick={() => setIsFavorite(!isFavorite)}
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

              {/* Buy Now alternative CTA */}
              <Button
                variant="secondary"
                className="text-apple-primary border-apple-primary/10 rounded-apple-pill hover:bg-apple-primary/5 mt-3 h-11 w-full cursor-pointer border text-[14px] font-semibold transition-all active:scale-95"
              >
                Купить сейчас
              </Button>
            </CardContent>
          </Card>

          {/* DELIVERY CARD */}
          <Card className="rounded-apple-lg border-apple-hairline overflow-hidden border shadow-none">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-heading text-apple-ink text-[14px] font-semibold">Доставка и возврат</h3>
                <ChevronRight className="text-apple-ink-muted-48 size-4" />
              </div>
              <Separator className="bg-apple-divider-soft" />

              {/* User Location */}
              <div className="hover:text-apple-primary group flex cursor-pointer items-start gap-2.5 text-[13px] transition-colors">
                <MapPin className="text-apple-ink-muted-48 group-hover:text-apple-primary mt-0.5 size-4 shrink-0" />
                <div className="flex flex-1 flex-col leading-snug">
                  <span className="text-apple-ink group-hover:text-apple-primary font-semibold underline decoration-dotted underline-offset-3 transition-colors">
                    Туркменабад, Туркменистан
                  </span>
                  <span className="text-apple-ink-muted-48 mt-0.5 text-[11px]">Со склада Ozon, Московская Область</span>
                </div>
              </div>

              {/* Stock count */}
              <div className="rounded-apple-sm flex items-center gap-1.5 border border-rose-100 bg-rose-50/50 p-2 text-[13px] leading-snug font-semibold text-rose-500">
                <span className="size-1.5 animate-pulse rounded-full bg-rose-500"></span>
                <span>В наличии — осталось {product.id === '1' ? '12 штук!' : '2 штуки!'}</span>
              </div>

              {/* Delivery Speed info */}
              <div className="bg-apple-canvas-parchment rounded-apple-sm border-apple-hairline text-apple-ink-muted-80 border p-2.5 text-[12px] leading-relaxed">
                <div className="text-apple-ink font-semibold">Пункты выдачи и постаматы</div>
                <div className="text-apple-primary mt-0.5 font-bold">19 июля • Без доплат</div>
              </div>

              {/* Return Policy */}
              <div className="text-apple-ink-muted-80 hover:text-apple-primary flex cursor-pointer items-center justify-between pt-1 text-[12px] transition-colors">
                <span>Можно вернуть в течение 15 дней</span>
                <ChevronRight className="text-apple-ink-muted-48 size-4" />
              </div>
            </CardContent>
          </Card>

          {/* MERCHANT STORE CARD */}
          <Card className="rounded-apple-lg border-apple-hairline overflow-hidden border shadow-none">
            <CardContent className="space-y-3.5 p-4">
              <div className="text-apple-ink-muted-48 text-[11px] font-bold tracking-wider uppercase select-none">
                Магазин
              </div>

              {/* Store Identity row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-apple-canvas-parchment text-apple-ink rounded-apple-full border-apple-hairline flex size-10 items-center justify-center border text-[16px] font-bold">
                    {product.merchant.name.charAt(0)}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <div className="flex items-center gap-1 text-[14px] font-semibold">
                      <span>{product.merchant.name}</span>
                      {product.merchant.verified && <Crown className="size-3.5 fill-amber-500 text-amber-500" />}
                    </div>
                    <button className="text-apple-primary mt-0.5 cursor-pointer text-left text-[12px] font-semibold transition-all hover:underline active:scale-95">
                      Перейти
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="text-apple-ink bg-apple-canvas-parchment rounded-apple-sm border-apple-hairline flex items-center gap-0.5 border px-1.5 py-0.5 text-[12px] font-bold">
                    <Star className="size-3 fill-amber-400 stroke-amber-400" strokeWidth={0} />
                    <span>{product.merchant.rating}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    className="h-7 cursor-pointer gap-1 px-2.5 text-[11px] font-semibold"
                  >
                    <MessageCircle className="text-apple-ink-muted-80 size-3" />
                    <span>Чат</span>
                  </Button>
                </div>
              </div>

              <Separator className="bg-apple-divider-soft" />

              {/* Orders count and general profile link */}
              <div className="flex items-center justify-between text-[13px]">
                <div className="text-apple-ink-muted-80 flex items-center gap-1.5 font-semibold">
                  <span>Заказы</span>
                  <span className="text-apple-ink font-bold">{product.merchant.orders}</span>
                </div>

                <button className="text-apple-ink-muted-80 hover:text-apple-primary flex cursor-pointer items-center gap-0.5 text-[12px] font-semibold transition-all transition-colors active:scale-95">
                  <span>О магазине</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TABS DETAILS SECTION (Organized Apple Grid System) */}
      <div id="details-tabs-section" className="border-apple-divider-soft mt-16 border-t pt-10">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
            <TabsTrigger value="merchant">Магазин и гарантия</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы ({product.reviewsCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-6">
            <div className="max-w-[800px]">
              <h3 className="text-apple-display-md text-apple-ink mb-4">Потрясающие возможности. Изящный дизайн.</h3>
              <p className="text-apple-body text-apple-ink-muted-80 mb-6 leading-relaxed">
                Этот продукт разработан с учетом строжайших стандартов качества и эргономики. Уникальные технологии,
                используемые при производстве, обеспечивают непревзойденный пользовательский опыт, долговечность и
                высокую производительность в любых условиях эксплуатации.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="bg-apple-canvas-parchment rounded-apple-lg border-apple-hairline border p-6">
                  <h4 className="font-heading text-apple-ink mb-2 font-semibold">Передовые технологии</h4>
                  <p className="text-apple-caption text-apple-ink-muted-80">
                    Каждая деталь спроектирована для максимальной эффективности, обеспечивая стабильную работу
                    устройства даже при самых высоких нагрузках.
                  </p>
                </div>
                <div className="bg-apple-canvas-parchment rounded-apple-lg border-apple-hairline border p-6">
                  <h4 className="font-heading text-apple-ink mb-2 font-semibold">Экологичный дизайн</h4>
                  <p className="text-apple-caption text-apple-ink-muted-80">
                    Мы заботимся об окружающей среде. Корпус устройства частично выполнен из переработанных материалов,
                    снижая углеродный след.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="max-w-[700px] space-y-4">
              <h3 className="font-heading text-apple-ink mb-6 text-lg font-semibold">Технические характеристики</h3>
              <div className="divide-apple-divider-soft divide-y">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-4 py-3 text-[14px]">
                    <span className="text-apple-ink-muted-48">{key}</span>
                    <span className="text-apple-ink max-w-[60%] text-right font-semibold">
                      {key === product.optionsLabel ? selectedOption : val}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-3 text-[14px]">
                  <span className="text-apple-ink-muted-48">Артикул товара</span>
                  <span className="text-apple-ink text-right font-semibold select-text">{product.articleNumber}</span>
                </div>
                <div className="flex justify-between gap-4 py-3 text-[14px]">
                  <span className="text-apple-ink-muted-48">Производитель</span>
                  <span className="text-apple-ink text-right font-semibold">{product.brand}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="merchant">
            <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg max-w-[700px] border p-6 shadow-none">
              <h3 className="font-heading text-apple-ink mb-4 text-[17px] font-semibold">Информация о продавце</h3>
              <div className="mb-6 flex items-center gap-4">
                <div className="bg-apple-ink rounded-apple-full flex size-12 items-center justify-center text-[18px] font-semibold text-white">
                  {product.merchant.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-apple-ink flex items-center gap-1.5 text-[16px] font-semibold">
                    <span>{product.merchant.name}</span>
                    {product.merchant.verified && <Crown className="size-4 fill-amber-500 text-amber-500" />}
                  </h4>
                  <p className="text-apple-ink-muted-48 mt-0.5 text-[12px]">
                    Рейтинг магазина: {product.merchant.rating} / 5.0
                  </p>
                </div>
              </div>
              <div className="border-apple-divider-soft grid grid-cols-2 gap-4 border-t pt-4 text-[13px]">
                <div>
                  <span className="text-apple-ink-muted-48">Выполнено заказов</span>
                  <p className="text-apple-ink mt-0.5 text-[15px] font-semibold">{product.merchant.orders}</p>
                </div>
                <div>
                  <span className="text-apple-ink-muted-48">Срок гарантии</span>
                  <p className="text-apple-ink mt-0.5 text-[15px] font-semibold">12 месяцев официальной гарантии</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="mb-8 flex items-center gap-6">
              <div className="text-center">
                <div className="text-apple-ink font-sans text-5xl font-extrabold tracking-tight">{product.rating}</div>
                <div className="mt-2 flex items-center justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-4',
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 stroke-amber-400'
                          : 'fill-neutral-200 stroke-neutral-200',
                      )}
                    />
                  ))}
                </div>
                <p className="text-apple-ink-muted-48 mt-1.5 text-[12px]">На основе {product.reviewsCount} отзывов</p>
              </div>

              <div className="max-w-[300px] flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const percentages = [82, 12, 4, 1, 1]
                  const pct = percentages[5 - stars]
                  return (
                    <div key={stars} className="flex items-center gap-2 text-[12px]">
                      <span className="w-3 text-right">{stars}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-apple-ink-muted-48 w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator className="bg-apple-divider-soft my-6" />

            <div className="space-y-6">
              <div className="bg-apple-canvas-parchment rounded-apple-md border-apple-hairline max-w-[800px] border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold">Алексей К.</span>
                    <span className="text-apple-ink-muted-48 text-[11px]">Проверенный покупатель</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 stroke-amber-400" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="text-apple-caption text-apple-ink-muted-80 leading-relaxed">
                  Отличный монитор за свои деньги. Цветопередача на высоте, IPS матрица действительно качественная.
                  Частота 120 Гц ощущается очень плавно как в играх, так и при обычном скроллинге. Сборка быстрая,
                  подставка устойчивая.
                </p>
              </div>
              <div className="bg-apple-canvas-parchment rounded-apple-md border-apple-hairline max-w-[800px] border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold">Мария С.</span>
                    <span className="text-apple-ink-muted-48 text-[11px]">Проверенный покупатель</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 stroke-amber-400" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="text-apple-caption text-apple-ink-muted-80 leading-relaxed">
                  Купила для работы с текстом и кодом. Глаза не устают благодаря технологии подавления мерцания. Очень
                  тонкие рамки, смотрится стильно и современно на столе.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
