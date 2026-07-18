'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import type { VendorProduct, VendorProductsResponse } from '@dtc/api-contracts'
import {
  ArrowLeft,
  Check,
  Clipboard,
  Globe,
  ImageOff,
  Info,
  Layers,
  Loader2,
  PackageSearch,
  Ruler,
  Tag,
  Weight,
} from 'lucide-react'
import { toast } from 'sonner'

import { getProductPriceLabel } from '@/components/products/ProductItem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/clipboard'
import { productStatus } from '@/lib/constants'
import { medusa } from '@/lib/medusa'

// Same country map used during product creation
const COUNTRY_NAMES: Record<string, string> = {
  TM: 'Туркменистан',
  TR: 'Турция',
  UZ: 'Узбекистан',
  CN: 'Китай',
  DE: 'Германия',
  US: 'США',
}

function formatPrice(amount: number, currencyCode: string) {
  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode.toUpperCase()}`
}

// ─── Small reusable components ───────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-apple-canvas border-apple-hairline rounded-apple-lg border p-6 lg:p-8 ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="border-apple-divider-soft mb-5 flex items-center gap-2.5 border-b pb-4">
      <Icon className="text-apple-primary size-5 shrink-0" aria-hidden="true" />
      <h2 className="text-apple-tagline text-apple-ink">{title}</h2>
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-apple-fine-print text-apple-ink-muted-48 mb-1 tracking-wide uppercase">{label}</dt>
      <dd className="text-apple-body text-apple-ink">{value}</dd>
    </div>
  )
}

function EmptyValue() {
  return <span className="text-apple-ink-muted-48 italic">Не указано</span>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<VendorProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [idCopied, setIdCopied] = useState(false)

  const handleCopyId = async (productId: string) => {
    try {
      await copyToClipboard(productId)
      setIdCopied(true)
      setTimeout(() => setIdCopied(false), 2000)
    } catch {
      toast.error('Не удалось скопировать ID')
    }
  }

  useEffect(() => {
    let isActive = true

    async function loadProduct() {
      try {
        const response = await medusa.client.fetch<VendorProductsResponse>('/vendors/products')
        if (isActive) {
          setProduct(response.products.find((item) => item.id === id) ?? null)
        }
      } catch (error) {
        if (isActive) {
          setHasLoadError(true)
          toast.error('Ошибка загрузки товара', {
            description: error instanceof Error ? error.message : 'Не удалось получить данные товара.',
          })
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isActive = false
    }
  }, [id])

  console.log('product', product)

  if (isLoading) {
    return (
      <div className="bg-apple-canvas-parchment flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center">
        <Loader2 className="text-apple-primary size-8 animate-spin" />
        <p className="text-apple-caption text-apple-ink-muted-48 mt-4">Загрузка товара...</p>
      </div>
    )
  }

  if (!product || hasLoadError) {
    return (
      <div className="bg-apple-canvas-parchment flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg max-w-md border p-8 text-center">
          <PackageSearch className="text-apple-ink-muted-48 mx-auto size-10" aria-hidden="true" />
          <h1 className="text-apple-tagline text-apple-ink mt-5">
            {hasLoadError ? 'Не удалось загрузить товар' : 'Товар не найден'}
          </h1>
          <p className="text-apple-caption text-apple-ink-muted-48 mt-2">
            {hasLoadError
              ? 'Проверьте подключение и попробуйте открыть страницу ещё раз.'
              : 'Возможно, товар был удалён или у вас больше нет к нему доступа.'}
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/dashboard/products">
              <ArrowLeft />К товарам
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const status = productStatus[product.status] ?? {
    label: product.status,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  }
  const variants = product.variants ?? []
  const images = product.images ?? []
  const categories = product.categories ?? []
  const keywords: string[] = product.metadata?.keywords ?? []

  // Collect unique product options from variant option values
  const optionMap = new Map<string, Set<string>>()
  variants.forEach((v) => {
    v.options?.forEach((opt) => {
      if (opt.option?.title) {
        if (!optionMap.has(opt.option.title)) {
          optionMap.set(opt.option.title, new Set())
        }
        optionMap.get(opt.option.title)!.add(opt.value)
      }
    })
  })

  const hasLogistics =
    product.weight || product.length || product.width || product.height || product.origin_country || product.material

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/products"
          className="text-apple-caption text-apple-primary inline-flex min-h-11 items-center gap-2 font-semibold"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Все товары
        </Link>

        {/* ── HERO CARD: thumbnail + core info ── */}
        <SectionCard className="overflow-hidden !p-0">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
            {/* Left — Thumbnail */}
            <section className="bg-apple-canvas-parchment border-apple-hairline flex min-h-80 items-center justify-center border-b p-8 lg:min-h-[26rem] lg:border-r lg:border-b-0">
              {product.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.thumbnail} alt={product.title} className="max-h-[22rem] w-full object-contain" />
              ) : (
                <div className="text-apple-ink-muted-48 flex flex-col items-center gap-3 text-center">
                  <ImageOff className="size-12" aria-hidden="true" />
                  <p className="text-apple-caption">Изображение товара не добавлено</p>
                </div>
              )}
            </section>

            {/* Right — Core product info */}
            <section className="flex flex-col p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-apple-fine-print text-apple-ink-muted-48 truncate text-[11px] tracking-widest uppercase">
                  {product.handle}
                </p>
                <Badge className={`shrink-0 ${status.className}`}>{status.label}</Badge>
              </div>

              <h1 className="text-apple-ink mt-4 text-[clamp(1.4rem,3vw,2rem)] leading-tight font-semibold tracking-tight">
                {product.title}
              </h1>

              <p className="text-apple-caption text-apple-ink-muted-80 mt-4 flex-1">
                {product.description || <EmptyValue />}
              </p>

              {/* Price */}
              <div className="border-apple-divider-soft mt-6 border-t pt-5">
                <p className="text-apple-fine-print text-apple-ink-muted-48 tracking-wide uppercase">Стоимость</p>
                <p className="text-apple-lead text-apple-ink mt-1 font-semibold">{getProductPriceLabel(product)}</p>
              </div>

              {/* ID + copy button */}
              <div className="mt-5">
                <p className="text-apple-fine-print text-apple-ink-muted-48 tracking-wide uppercase">ID товара</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-apple-caption text-apple-ink truncate font-mono" title={product.id}>
                    {product.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(product.id)}
                    title={idCopied ? 'Скопировано' : 'Скопировать ID'}
                    className="text-apple-ink-muted-48 hover:text-apple-primary shrink-0 rounded p-0.5 transition-colors"
                    aria-label="Скопировать ID товара"
                  >
                    {idCopied ? <Check className="size-3.5 text-green-500" /> : <Clipboard className="size-3.5" />}
                  </button>
                  {idCopied && (
                    <span className="animate-fade-in text-[11px] font-medium text-green-600">ID скопирован</span>
                  )}
                </div>
              </div>
            </section>
          </div>
        </SectionCard>

        {/* ── SECTION 1: General info (Step 1 of create form) ── */}
        <SectionCard>
          <SectionHeader icon={Info} title="Общая информация" />
          <dl className="grid gap-6 sm:grid-cols-2">
            {/* Category */}
            <FieldRow
              label="Категория"
              value={
                categories.length ? (
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="bg-apple-canvas-parchment text-apple-ink border-apple-hairline rounded-apple-pill inline-flex items-center border px-2.5 py-1 text-[13px]"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptyValue />
                )
              }
            />

            {/* Tags / Keywords */}
            <FieldRow
              label="Теги / Поисковые слова"
              value={
                keywords.length ? (
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="bg-apple-primary/8 text-apple-primary border-apple-primary/20 rounded-apple-pill inline-flex items-center gap-1 border px-2.5 py-1 text-[13px]"
                      >
                        <Tag className="size-3 opacity-70" />
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptyValue />
                )
              }
            />
          </dl>
        </SectionCard>

        {/* ── SECTION 2: Gallery images (Step 2 of create form) ── */}
        {images.length > 0 && (
          <SectionCard>
            <SectionHeader icon={ImageOff} title="Галерея изображений" />
            <div className="grid grid-cols-6 gap-3 max-md:grid-cols-4 max-sm:grid-cols-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="border-apple-hairline rounded-apple-sm bg-apple-canvas-parchment overflow-hidden border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`Изображение ${idx + 1}`}
                    className="aspect-square w-full object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── SECTION 3: Logistics, dimensions & product options (merged) ── */}
        {(hasLogistics || optionMap.size > 0) && (
          <SectionCard>
            <SectionHeader icon={Ruler} title="Характеристики и Габариты" />
            <div className="space-y-6">
              {/* Dimensions row */}
              {(product.weight || product.length || product.width || product.height) && (
                <dl className="grid grid-cols-4 gap-4 max-sm:grid-cols-2">
                  <FieldRow
                    label="Вес (г)"
                    value={
                      product.weight != null ? (
                        <span className="flex items-center gap-1.5">
                          <Weight className="text-apple-ink-muted-48 size-3.5" />
                          {product.weight}
                        </span>
                      ) : (
                        <EmptyValue />
                      )
                    }
                  />
                  <FieldRow label="Длина (см)" value={product.length != null ? product.length : <EmptyValue />} />
                  <FieldRow label="Ширина (см)" value={product.width != null ? product.width : <EmptyValue />} />
                  <FieldRow label="Высота (см)" value={product.height != null ? product.height : <EmptyValue />} />
                </dl>
              )}

              {/* Origin country + Material */}
              {(product.origin_country || product.material) && (
                <dl
                  className={`grid grid-cols-2 gap-4 max-sm:grid-cols-1${
                    product.weight || product.length || product.width || product.height
                      ? 'border-apple-divider-soft border-t pt-5'
                      : ''
                  }`}
                >
                  <FieldRow
                    label="Страна происхождения"
                    value={
                      product.origin_country ? (
                        <span className="flex items-center gap-1.5">
                          <Globe className="text-apple-ink-muted-48 size-3.5" />
                          {COUNTRY_NAMES[product.origin_country] ?? product.origin_country}
                        </span>
                      ) : (
                        <EmptyValue />
                      )
                    }
                  />
                  <FieldRow label="Материал" value={product.material || <EmptyValue />} />
                </dl>
              )}

              {/* Product options (e.g. Размер: S, M, L) */}
              {optionMap.size > 0 && (
                <dl
                  className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3${
                    hasLogistics ? 'border-apple-divider-soft border-t pt-5' : ''
                  }`}
                >
                  {Array.from(optionMap.entries()).map(([optionTitle, values]) => (
                    <FieldRow
                      key={optionTitle}
                      label={optionTitle}
                      value={
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {Array.from(values).map((val) => (
                            <span
                              key={val}
                              className="bg-apple-canvas-parchment text-apple-ink border-apple-hairline rounded-apple-pill border px-2.5 py-0.5 text-[13px]"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  ))}
                </dl>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── SECTION 5: Variants table (Step 3 of create form) ── */}
        <SectionCard>
          <SectionHeader icon={Layers} title={`Варианты товара${variants.length ? ` (${variants.length})` : ''}`} />
          <p className="text-apple-caption text-apple-ink-muted-48 -mt-2 mb-5">Цена и артикул для каждого варианта.</p>

          {variants.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-apple-hairline text-apple-ink-muted-48 border-b text-[12px] font-semibold tracking-wide uppercase">
                    <th className="px-2 py-3">Вариант</th>
                    <th className="px-2 py-3">Цена</th>
                    <th className="px-2 py-3">Артикул (SKU)</th>
                  </tr>
                </thead>
                <tbody className="divide-apple-divider-soft divide-y text-[14px]">
                  {variants.map((variant) => {
                    const price = variant.prices?.[0]
                    return (
                      <tr key={variant.id} className="hover:bg-apple-canvas-parchment/50 transition-colors">
                        <td className="text-apple-ink px-2 py-4 font-semibold">{variant.title}</td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          {price ? (
                            <span className="text-apple-ink font-medium">
                              {formatPrice(price.amount, price.currency_code)}
                            </span>
                          ) : (
                            <EmptyValue />
                          )}
                        </td>
                        <td className="px-2 py-4">
                          {variant.sku ? (
                            <code className="bg-apple-canvas-parchment text-apple-ink-muted-80 rounded px-1.5 py-0.5 font-mono text-[12px]">
                              {variant.sku}
                            </code>
                          ) : (
                            <EmptyValue />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-apple-canvas-parchment border-apple-hairline rounded-apple-md flex min-h-28 items-center justify-center border p-5 text-center">
              <p className="text-apple-caption text-apple-ink-muted-48">Варианты для этого товара ещё не добавлены.</p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
