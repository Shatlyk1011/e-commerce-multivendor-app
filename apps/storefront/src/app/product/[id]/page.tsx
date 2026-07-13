"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Heart,
  Star,
  ShoppingBag,
  Check,
  ChevronRight,
  MapPin,
  MessageSquare,
  Share2,
  GitCompare,
  ShieldCheck,
  Play,
  Info,
  MessageCircle,
  Crown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PRODUCT_DATABASE, ProductDetail } from "./data"

// Predefined detailed mock database. If user accesses /product/1 or similar, they see the corresponding detailed info.

// Fallback product structure in case of any arbitrary ID
const DEFAULT_PRODUCT: ProductDetail = PRODUCT_DATABASE["3060163799"]

export default function ProductDetailPage() {
  const params = useParams()
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id || ""
  
  // Lookup product in database or fallback
  const product = PRODUCT_DATABASE[idStr] || {
    ...DEFAULT_PRODUCT,
    id: idStr || DEFAULT_PRODUCT.id,
  }

  // State Management
  const [activeImageIdx, setActiveImageIdx] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState(product.options[1] || product.options[0] || "")
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [cartState, setCartState] = React.useState<"idle" | "added">("idle")
  const [compareState, setCompareState] = React.useState(false)

  // Handlers
  const handleAddToCart = () => {
    setCartState("added")
    setTimeout(() => {
      setCartState("idle")
    }, 2000)
  }

  // Predefined grey placeholders mapping for product images (6 angles/variants)
  const MOCK_GALLERY = [
    {
      title: "Front View",
      description: "Frontal display layout",
      overlay: (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none text-apple-ink">
          <div className="text-[28px] font-heading font-semibold text-apple-ink tracking-tight mb-1">
            {product.brand} {selectedOption}
          </div>
          <div className="text-[13px] text-apple-ink-muted-48 uppercase tracking-widest font-semibold mb-6">
            Встроенные динамики
          </div>
          <div className="w-[80%] h-px bg-apple-hairline mb-6"></div>
          <div className="flex gap-4 items-center justify-center">
            <Badge variant="outline" size="default" className="shadow-xs font-bold">FHD</Badge>
            <Badge variant="outline" size="default" className="shadow-xs font-bold">120Hz</Badge>
            <Badge variant="outline" size="default" className="shadow-xs font-bold">IPS</Badge>
          </div>
          <div className="mt-12 text-[11px] text-apple-ink-muted-48 font-semibold">
            [ Интерактивный серый макет ]
          </div>
        </div>
      )
    },
    {
      title: "Side View",
      description: "Ultra-slim 7.9mm side perspective",
      overlay: (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-apple-ink select-none">
          <div className="w-4 h-64 bg-apple-ink/90 rounded-full shadow-lg relative flex items-center justify-center">
            <div className="absolute -left-12 text-[12px] font-semibold text-apple-ink-muted-48">7.9 mm</div>
          </div>
          <div className="mt-6 text-[14px] font-semibold">Угол наклона -5° до +20°</div>
          <div className="text-[12px] text-apple-ink-muted-48 mt-1">Регулируемая эргономичная подставка</div>
        </div>
      )
    },
    {
      title: "Back Ports",
      description: "HDMI, DisplayPort and DC inputs",
      overlay: (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-apple-ink select-none">
          <div className="grid grid-cols-3 gap-6 p-4 bg-apple-canvas border border-apple-hairline rounded-apple-lg shadow-sm">
            <div className="flex flex-col items-center">
              <span className="w-8 h-4 bg-neutral-400 rounded-xs mb-1"></span>
              <span className="text-[10px] font-semibold text-apple-ink-muted-80">HDMI 1.4</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-8 h-4 bg-neutral-400 rounded-xs mb-1"></span>
              <span className="text-[10px] font-semibold text-apple-ink-muted-80">DP 1.2</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 bg-neutral-400 rounded-full mb-1"></span>
              <span className="text-[10px] font-semibold text-apple-ink-muted-80">Audio Out</span>
            </div>
          </div>
          <div className="mt-6 text-[13px] font-semibold text-center">Поддержка VESA 75x75 мм</div>
          <div className="text-[12px] text-apple-ink-muted-48 text-center mt-1">Слот замка безопасности Kensington</div>
        </div>
      )
    },
    {
      title: "Color Gamut",
      description: "Color accuracy representations",
      overlay: (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-apple-ink select-none">
          <div className="size-36 rounded-full border-4 border-dashed border-apple-primary/40 flex items-center justify-center relative">
            <div className="size-24 rounded-full bg-apple-canvas border border-apple-hairline flex items-center justify-center font-bold text-[14px]">
              99% sRGB
            </div>
          </div>
          <div className="mt-6 text-[14px] font-semibold">16.7 миллионов цветов</div>
          <div className="text-[12px] text-apple-ink-muted-48 mt-1">Идеально для работы с графикой и текстом</div>
        </div>
      )
    },
    {
      title: "Stand Installation",
      description: "Toolless setup instruction details",
      overlay: (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-apple-ink select-none">
          <div className="flex items-center gap-2 text-apple-primary font-bold mb-4">
            <ShieldCheck className="size-6" />
            <span>Быстрая сборка за 1 минуту</span>
          </div>
          <div className="text-[13px] text-apple-ink-muted-80 max-w-[280px] text-center leading-relaxed">
            Вставьте ножку до щелчка. Закрутите один фиксирующий винт у основания без дополнительных инструментов.
          </div>
        </div>
      )
    },
  
  ]

  return (
    <main className="min-h-screen bg-apple-canvas text-apple-ink antialiased px-4 py-6 max-w-[1240px] mx-auto select-none">
      
      {/* BREADCRUMB AND UTILITY ACTIONS LINE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 mb-6 border-b border-apple-divider-soft text-[13px]">
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
              const isLast = index === product.categoryPath.length - 1;
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
        <div className="flex items-center gap-6 text-apple-ink-muted-80 font-medium">
          <span className="text-apple-ink-muted-48 select-text">Артикул: {product.articleNumber}</span>

          <Button variant={"ghost"} size="xs">
            <Share2 className="size-4" />
            <span>Поделиться</span>
          </Button>
        </div>
      </div>

      {/* CORE CONTENT LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-8 items-start relative">
        
        {/* COLUMN 1: PRODUCT GALLERY (5 cols) */}
        <div className="lg:col-span-5 flex gap-4 sticky ">
          
          {/* Thumbnails Sidebar */}
          <div className="flex flex-col gap-2 shrink-0">
            {MOCK_GALLERY.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={cn(
                  "size-14 rounded-apple-sm border overflow-hidden bg-apple-canvas-parchment flex items-center justify-center relative cursor-pointer active:scale-95 transition-all duration-100",
                  activeImageIdx === idx 
                    ? "border-apple-primary ring-1 ring-apple-primary" 
                    : "border-apple-hairline hover:border-apple-ink-muted-48"
                )}
              >
                  <div className="text-[9px] font-bold text-apple-ink-muted-48 text-center px-0.5 leading-tight">
                    {thumb.title.split(" ")[0]}
                  </div>
              </button>
            ))}
          </div>

          {/* Main Large Image Box with Apple-signature drop shadow */}
          <div className="flex-1 aspect-[3/4] rounded-apple-lg border border-apple-hairline bg-apple-canvas-parchment overflow-hidden relative shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0]">
            {/* Overlay contents containing styled mock layout elements */}
            {MOCK_GALLERY[activeImageIdx]?.overlay}

            {/* Bottom mini status display inside mock container */}
            <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[11px] px-2.5 py-1 rounded-apple-pill backdrop-blur-xs select-none">
              {activeImageIdx + 1} / {MOCK_GALLERY.length}
            </div>
          </div>
        </div>

        {/* COLUMN 2: PRODUCT CORE FIELDS (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          
          {/* Brand and Badge */}
          <div className="flex items-center gap-2 mb-2">
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
          <h1 className="text-[24px] font-heading font-semibold text-apple-ink tracking-tight leading-tight mb-3">
            {product.title}
          </h1>

          {/* Rating, Reviews, Questions */}
          <div className="flex items-center flex-wrap gap-4 text-[13px] mb-6">
            <div className="flex items-center gap-1 text-apple-ink font-semibold">
              <Star className="size-4 fill-amber-400 stroke-amber-400" strokeWidth={0} />
              <span>{product.rating}</span>
            </div>
            
            <span className="text-apple-ink-muted-48">•</span>
            
            <span className="text-apple-primary font-semibold hover:underline cursor-pointer">
              {product.reviewsCount.toLocaleString()} отзывов
            </span>
            
            <span className="text-apple-ink-muted-48">•</span>
            
            <span className="text-apple-ink-muted-80 hover:text-apple-primary transition-colors cursor-pointer font-semibold flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {product.questionsCount} вопросов
            </span>
          </div>

          {/* Brand info details box */}
          <div className="flex items-center gap-3 p-3 bg-apple-surface-pearl border border-apple-hairline rounded-apple-md mb-6 max-w-sm">
            <div className="size-9 bg-apple-ink text-white font-bold flex items-center justify-center text-[15px] rounded-apple-sm">
              {product.brand.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold leading-tight">{product.brand}</span>
              <span className="text-[12px] text-apple-ink-muted-48">Бренд проверен</span>
            </div>
          </div>

          {/* Configurator option chips */}
          <div className="mb-8">
            <div className="text-[13px] text-apple-ink-muted-48 font-medium mb-3 flex items-center gap-1">
              <span>{product.optionsLabel}:</span>
              <span className="font-semibold text-apple-ink">{selectedOption}</span>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {product.options.map((option) => {
                const isSelected = selectedOption === option
                return (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={cn(
                      "min-w-[56px] text-center px-4 py-2 text-[14px] font-semibold transition-all cursor-pointer relative active:scale-95 duration-100",
                      isSelected
                        ? "bg-apple-canvas text-apple-ink ring-2 ring-apple-primary-focus rounded-apple-pill"
                        : "bg-apple-canvas text-apple-ink-muted-80 border border-apple-hairline hover:border-apple-ink-muted-48 rounded-apple-pill"
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
            <Separator className="mb-6 bg-apple-divider-soft" />
            <h2 className="text-[16px] font-heading font-semibold text-apple-ink mb-4">
              О товаре
            </h2>
            
            <div className="space-y-3.5">
              {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                <div key={key} className="flex justify-between items-baseline gap-4 text-[13px]">
                  <div className="text-apple-ink-muted-48 flex-1 flex items-baseline select-none">
                    <span className="bg-apple-canvas pr-1.5 z-10 shrink-0">{key}</span>
                    <span className="flex-1 border-b border-dotted border-apple-hairline -translate-y-1 h-[2px]"></span>
                  </div>
                  <div className="text-apple-ink font-semibold text-right max-w-[50%] shrink-0">
                    {key === product.optionsLabel ? selectedOption : val}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const el = document.getElementById("details-tabs-section");
                el?.scrollIntoView({ behavior: "smooth" });
                // Switch tab value programmatically if needed (currently defaulted to page navigation)
              }}
              className="text-apple-primary font-semibold text-[13px] mt-4 hover:underline flex items-center gap-0.5 cursor-pointer active:scale-95 transition-all duration-100"
            >
              <span>Все характеристики</span>
              <ChevronRight className="size-4" strokeWidth={2.5} />
            </button>
          </div>

        </div>

        {/* COLUMN 3: SIDEBAR / PURCHASE & DELIVERY DETAILS (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* BUY BOX CARD */}
          <Card className="rounded-apple-lg border border-apple-hairline shadow-none overflow-hidden">
            <CardContent className="p-5">
              {/* Promo Banner inside Box */}
              <div className="flex items-center justify-between gap-1.5 p-2 bg-rose-50 border border-rose-200/50 rounded-apple-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <Badge variant="destructive" size="xs">
                    Sale
                  </Badge>
                  <span className="text-[11px] font-bold text-rose-700">{product.id === "1" ? "12 ед. осталось" : "462 ед. осталось"}</span>
                </div>
                <span className="text-[10px] text-rose-500 font-semibold shrink-0">18 дн.</span>
              </div>

              {/* Price display with Info Tooltip */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[28px] font-semibold text-apple-ink tracking-tight font-sans">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <div className="flex items-center gap-1 text-apple-ink-muted-48 text-[15px] font-medium font-sans select-none">
                    <span className="line-through">{product.originalPrice}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="outline-none text-apple-ink-muted-48 hover:text-apple-ink transition-colors cursor-pointer">
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
              <div className="bg-apple-canvas-parchment border border-apple-hairline rounded-apple-sm p-2 text-[12px] text-apple-ink-muted-80 font-medium mb-5 flex items-center justify-between">
                <span>Рассрочка в месяц:</span>
                <span className="font-bold text-apple-ink">{product.installmentPrice}</span>
              </div>

              {/* Actions row */}
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  variant="default"
                  className="flex-1 flex flex-col justify-center items-center h-12 leading-tight py-2 font-semibold cursor-pointer relative"
                >
                  <div className="flex items-center gap-1.5">
                    {cartState === "added" ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                    <span>{cartState === "added" ? "В корзине" : "В корзину"}</span>
                  </div>
                  <span className="text-[9px] text-apple-on-primary/80 font-normal">Доставим 19 июля</span>
                </Button>

                <Button
                  onClick={() => setIsFavorite(!isFavorite)}
                  variant="pearl"
                  size="icon-lg"
                  className="size-12 shrink-0 flex items-center justify-center cursor-pointer border border-apple-divider-soft"
                >
                  <Heart className={cn("size-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-apple-ink-muted-80")} />
                </Button>
              </div>

              {/* Buy Now alternative CTA */}
              <Button
                variant="secondary"
                className="w-full mt-3 h-11 font-semibold text-apple-primary cursor-pointer border border-apple-primary/10 rounded-apple-pill hover:bg-apple-primary/5 active:scale-95 transition-all text-[14px]"
              >
                Купить сейчас
              </Button>
            </CardContent>
          </Card>

          {/* DELIVERY CARD */}
          <Card className="rounded-apple-lg border border-apple-hairline shadow-none overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-heading font-semibold text-[14px] text-apple-ink">Доставка и возврат</h3>
                <ChevronRight className="size-4 text-apple-ink-muted-48" />
              </div>
              <Separator className="bg-apple-divider-soft" />

              {/* User Location */}
              <div className="flex items-start gap-2.5 text-[13px] hover:text-apple-primary transition-colors cursor-pointer group">
                <MapPin className="size-4 text-apple-ink-muted-48 group-hover:text-apple-primary shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col leading-snug">
                  <span className="font-semibold text-apple-ink group-hover:text-apple-primary transition-colors underline decoration-dotted underline-offset-3">
                    Туркменабад, Туркменистан
                  </span>
                  <span className="text-[11px] text-apple-ink-muted-48 mt-0.5">Со склада Ozon, Московская Область</span>
                </div>
              </div>

              {/* Stock count */}
              <div className="text-[13px] leading-snug font-semibold text-rose-500 bg-rose-50/50 border border-rose-100 rounded-apple-sm p-2 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>В наличии — осталось {product.id === "1" ? "12 штук!" : "2 штуки!"}</span>
              </div>

              {/* Delivery Speed info */}
              <div className="text-[12px] bg-apple-canvas-parchment p-2.5 rounded-apple-sm leading-relaxed border border-apple-hairline text-apple-ink-muted-80">
                <div className="font-semibold text-apple-ink">Пункты выдачи и постаматы</div>
                <div className="mt-0.5 text-apple-primary font-bold">19 июля • Без доплат</div>
              </div>

              {/* Return Policy */}
              <div className="flex items-center justify-between text-[12px] text-apple-ink-muted-80 hover:text-apple-primary cursor-pointer transition-colors pt-1">
                <span>Можно вернуть в течение 15 дней</span>
                <ChevronRight className="size-4 text-apple-ink-muted-48" />
              </div>
            </CardContent>
          </Card>

          {/* MERCHANT STORE CARD */}
          <Card className="rounded-apple-lg border border-apple-hairline shadow-none overflow-hidden">
            <CardContent className="p-4 space-y-3.5">
              <div className="text-[11px] font-bold text-apple-ink-muted-48 uppercase tracking-wider select-none">Магазин</div>
              
              {/* Store Identity row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-apple-canvas-parchment text-apple-ink font-bold flex items-center justify-center text-[16px] rounded-apple-full border border-apple-hairline">
                    {product.merchant.name.charAt(0)}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <div className="flex items-center gap-1 font-semibold text-[14px]">
                      <span>{product.merchant.name}</span>
                      {product.merchant.verified && (
                        <Crown className="size-3.5 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <button className="text-apple-primary text-[12px] font-semibold hover:underline mt-0.5 text-left cursor-pointer active:scale-95 transition-all">
                      Перейти
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5 text-[12px] font-bold text-apple-ink bg-apple-canvas-parchment px-1.5 py-0.5 rounded-apple-sm border border-apple-hairline">
                    <Star className="size-3 fill-amber-400 stroke-amber-400" strokeWidth={0} />
                    <span>{product.merchant.rating}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-7 text-[11px] font-semibold gap-1 px-2.5 cursor-pointer"
                  >
                    <MessageCircle className="size-3 text-apple-ink-muted-80" />
                    <span>Чат</span>
                  </Button>
                </div>
              </div>

              <Separator className="bg-apple-divider-soft" />

              {/* Orders count and general profile link */}
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1.5 text-apple-ink-muted-80 font-semibold">
                  <span>Заказы</span>
                  <span className="font-bold text-apple-ink">{product.merchant.orders}</span>
                </div>

                <button className="text-apple-ink-muted-80 font-semibold hover:text-apple-primary cursor-pointer transition-colors text-[12px] flex items-center gap-0.5 active:scale-95 transition-all">
                  <span>О магазине</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* TABS DETAILS SECTION (Organized Apple Grid System) */}
      <div id="details-tabs-section" className="mt-16 border-t border-apple-divider-soft pt-10">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
            <TabsTrigger value="merchant">Магазин и гарантия</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы ({product.reviewsCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-6">
            <div className="max-w-[800px]">
              <h3 className="text-apple-display-md mb-4 text-apple-ink">
                Потрясающие возможности. Изящный дизайн.
              </h3>
              <p className="text-apple-body text-apple-ink-muted-80 leading-relaxed mb-6">
                Этот продукт разработан с учетом строжайших стандартов качества и эргономики. Уникальные технологии, используемые при производстве, обеспечивают непревзойденный пользовательский опыт, долговечность и высокую производительность в любых условиях эксплуатации.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div className="p-6 bg-apple-canvas-parchment rounded-apple-lg border border-apple-hairline">
                  <h4 className="font-heading font-semibold text-apple-ink mb-2">Передовые технологии</h4>
                  <p className="text-apple-caption text-apple-ink-muted-80">
                    Каждая деталь спроектирована для максимальной эффективности, обеспечивая стабильную работу устройства даже при самых высоких нагрузках.
                  </p>
                </div>
                <div className="p-6 bg-apple-canvas-parchment rounded-apple-lg border border-apple-hairline">
                  <h4 className="font-heading font-semibold text-apple-ink mb-2">Экологичный дизайн</h4>
                  <p className="text-apple-caption text-apple-ink-muted-80">
                    Мы заботимся об окружающей среде. Корпус устройства частично выполнен из переработанных материалов, снижая углеродный след.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="specs">
            <div className="max-w-[700px] space-y-4">
              <h3 className="font-heading font-semibold text-lg text-apple-ink mb-6">Технические характеристики</h3>
              <div className="divide-y divide-apple-divider-soft">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="py-3 flex justify-between gap-4 text-[14px]">
                    <span className="text-apple-ink-muted-48">{key}</span>
                    <span className="text-apple-ink font-semibold text-right max-w-[60%]">
                      {key === product.optionsLabel ? selectedOption : val}
                    </span>
                  </div>
                ))}
                <div className="py-3 flex justify-between gap-4 text-[14px]">
                  <span className="text-apple-ink-muted-48">Артикул товара</span>
                  <span className="text-apple-ink font-semibold text-right select-text">{product.articleNumber}</span>
                </div>
                <div className="py-3 flex justify-between gap-4 text-[14px]">
                  <span className="text-apple-ink-muted-48">Производитель</span>
                  <span className="text-apple-ink font-semibold text-right">{product.brand}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="merchant">
            <div className="max-w-[700px] p-6 bg-apple-canvas border border-apple-hairline rounded-apple-lg shadow-none">
              <h3 className="font-heading font-semibold text-[17px] text-apple-ink mb-4">Информация о продавце</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 bg-apple-ink text-white font-semibold flex items-center justify-center text-[18px] rounded-apple-full">
                  {product.merchant.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-[16px] text-apple-ink flex items-center gap-1.5">
                    <span>{product.merchant.name}</span>
                    {product.merchant.verified && <Crown className="size-4 text-amber-500 fill-amber-500" />}
                  </h4>
                  <p className="text-[12px] text-apple-ink-muted-48 mt-0.5">Рейтинг магазина: {product.merchant.rating} / 5.0</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[13px] border-t border-apple-divider-soft pt-4">
                <div>
                  <span className="text-apple-ink-muted-48">Выполнено заказов</span>
                  <p className="font-semibold text-apple-ink text-[15px] mt-0.5">{product.merchant.orders}</p>
                </div>
                <div>
                  <span className="text-apple-ink-muted-48">Срок гарантии</span>
                  <p className="font-semibold text-apple-ink text-[15px] mt-0.5">12 месяцев официальной гарантии</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-apple-ink font-sans tracking-tight">{product.rating}</div>
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 stroke-amber-400"
                          : "fill-neutral-200 stroke-neutral-200"
                      )}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-apple-ink-muted-48 mt-1.5">На основе {product.reviewsCount} отзывов</p>
              </div>
              
              <div className="flex-1 max-w-[300px] space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const percentages = [82, 12, 4, 1, 1]
                  const pct = percentages[5 - stars]
                  return (
                    <div key={stars} className="flex items-center gap-2 text-[12px]">
                      <span className="w-3 text-right">{stars}</span>
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-8 text-right text-apple-ink-muted-48">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <Separator className="my-6 bg-apple-divider-soft" />
            
            <div className="space-y-6">
              <div className="p-4 bg-apple-canvas-parchment rounded-apple-md border border-apple-hairline max-w-[800px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px]">Алексей К.</span>
                    <span className="text-[11px] text-apple-ink-muted-48">Проверенный покупатель</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 stroke-amber-400" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="text-apple-caption text-apple-ink-muted-80 leading-relaxed">
                  Отличный монитор за свои деньги. Цветопередача на высоте, IPS матрица действительно качественная. Частота 120 Гц ощущается очень плавно как в играх, так и при обычном скроллинге. Сборка быстрая, подставка устойчивая.
                </p>
              </div>
              <div className="p-4 bg-apple-canvas-parchment rounded-apple-md border border-apple-hairline max-w-[800px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px]">Мария С.</span>
                    <span className="text-[11px] text-apple-ink-muted-48">Проверенный покупатель</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 stroke-amber-400" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="text-apple-caption text-apple-ink-muted-80 leading-relaxed">
                  Купила для работы с текстом и кодом. Глаза не устают благодаря технологии подавления мерцания. Очень тонкие рамки, смотрится стильно и современно на столе.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
