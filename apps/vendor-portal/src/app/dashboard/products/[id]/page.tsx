'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import type { VendorProduct, VendorProductsResponse } from '@dtc/api-contracts'
import {
  ArrowLeft,
  Boxes,
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

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getProductPriceLabel } from '@/features/products/components/ProductItem'
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
    <div className={`bg-apple-canvas border-apple-hairline rounded-apple-lg border p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  extra,
}: {
  icon: React.ElementType
  title: string
  extra?: React.ReactNode
}) {
  return (
    <div className="border-apple-divider-soft mb-4 flex items-center justify-between border-b pb-3">
      <div className="flex items-center gap-2">
        <Icon className="text-apple-primary size-4 shrink-0" aria-hidden="true" />
        <h2 className="text-apple-ink text-[15px] font-semibold tracking-tight">{title}</h2>
      </div>
      {extra}
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-apple-fine-print font-heading text-apple-ink-muted-48 mb-1 tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-apple-ink text-sm font-semibold">{value}</dd>
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

  // Total inventory across all variants
  const totalInventory = variants.reduce((sum, v) => sum + (v.inventory_quantity ?? 0), 0)

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
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-6 max-md:p-4">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Back link */}
        <Link
          href="/dashboard/products"
          className="text-apple-caption text-apple-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Все товары
        </Link>

        {/* ── HERO CARD: thumbnail + core info (Compact fit layout) ── */}
        <SectionCard className="overflow-hidden !p-0">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
            {/* Left — Thumbnail */}
            <div className="bg-apple-canvas-parchment border-apple-hairline flex items-center justify-center border-b p-5 lg:border-r lg:border-b-0">
              {product.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="rounded-apple-md max-h-48 w-full object-contain"
                />
              ) : (
                <div className="text-apple-ink-muted-48 flex flex-col items-center gap-2 py-6 text-center">
                  <ImageOff className="size-10" aria-hidden="true" />
                  <p className="text-apple-fine-print">Без фото</p>
                </div>
              )}
            </div>

            {/* Right — Core product info */}
            <div className="flex flex-col justify-between space-y-4 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-apple-fine-print text-apple-ink-muted-48 truncate text-[11px] tracking-wider uppercase">
                    {product.handle}
                  </p>
                  <Badge className={`shrink-0 ${status.className}`}>{status.label}</Badge>
                </div>

                <h1 className="text-apple-ink mt-2 text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
                  {product.title}
                </h1>

                {/* ID + copy button */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-apple-fine-print text-apple-ink-muted-48 uppercase">ID:</span>
                  <span className="text-apple-caption text-apple-ink truncate font-mono text-[12px]" title={product.id}>
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
                    <span className="animate-fade-in text-[11px] font-medium text-green-600">Скопирован</span>
                  )}
                </div>
              </div>

              {/* Core metrics summary bar */}
              <div className="border-apple-divider-soft flex flex-wrap items-center justify-between gap-4 border-t pt-3">
                <div>
                  <p className="text-apple-fine-print text-apple-ink-muted-48 text-[11px] tracking-wide uppercase">
                    Стоимость
                  </p>
                  <p className="text-apple-ink mt-0.5 text-lg font-semibold">{getProductPriceLabel(product)}</p>
                </div>

                <div className="bg-apple-canvas-parchment border-apple-hairline rounded-apple-md flex items-center gap-2 border px-3 py-1.5">
                  <Boxes className="text-apple-primary size-4 shrink-0" />
                  <div>
                    <p className="text-apple-fine-print text-apple-ink-muted-48 text-[10px] uppercase">Общий остаток</p>
                    <p className="text-apple-ink text-[13px] leading-tight font-semibold">
                      {totalInventory > 0 ? (
                        <span className="font-medium text-green-700">{totalInventory} шт. в наличии</span>
                      ) : (
                        <span className="font-medium text-red-600">Нет в наличии</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 2-COLUMN SECTION GRID ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* ── SECTION 1: General info ── */}
          <SectionCard>
            <SectionHeader icon={Info} title="Общая информация" />
            <dl className="space-y-4">
              {/* Category */}
              <FieldRow
                label="Категория"
                value={
                  categories.length ? (
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="bg-apple-canvas-parchment text-apple-ink border-apple-hairline rounded-apple-pill inline-flex items-center border px-2.5 py-0.5 text-[13px]"
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
                          className="bg-apple-primary/8 text-apple-primary border-apple-primary/20 rounded-apple-pill inline-flex items-center gap-1 border px-2.5 py-0.5 text-[13px]"
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

          {/* ── SECTION 2: Gallery images ── */}
          <SectionCard>
            <SectionHeader
              icon={ImageOff}
              title="Галерея изображений"
              extra={
                images.length > 0 ? (
                  <span className="text-apple-ink-muted-48 text-[12px]">{images.length} фото</span>
                ) : undefined
              }
            />
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-2.5 max-sm:grid-cols-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="border-apple-hairline rounded-apple-sm bg-apple-canvas-parchment overflow-hidden border p-1"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`Изображение ${idx + 1}`} className="aspect-square w-full object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-apple-caption text-apple-ink-muted-48 italic">Дополнительные фото не загружены</p>
            )}
          </SectionCard>
        </div>

        {/* ── SECTION 3: Logistics, dimensions & product options ── */}
        {(hasLogistics || optionMap.size > 0) && (
          <SectionCard>
            <SectionHeader icon={Ruler} title="Характеристики и Габариты" />
            <div className="space-y-4">
              {/* Dimensions row */}
              {(product.weight || product.length || product.width || product.height) && (
                <dl className="grid grid-cols-4 gap-4 max-sm:grid-cols-2">
                  <FieldRow
                    label="Вес (г)"
                    value={
                      product.weight != null ? (
                        <span className="flex items-center gap-1.5">
                          <Weight className="text-apple-ink-muted-48 size-3.5" />
                          {product.weight} г
                        </span>
                      ) : (
                        <EmptyValue />
                      )
                    }
                  />
                  <FieldRow
                    label="Длина (см)"
                    value={product.length != null ? `${product.length} см` : <EmptyValue />}
                  />
                  <FieldRow
                    label="Ширина (см)"
                    value={product.width != null ? `${product.width} см` : <EmptyValue />}
                  />
                  <FieldRow
                    label="Высота (см)"
                    value={product.height != null ? `${product.height} см` : <EmptyValue />}
                  />
                </dl>
              )}

              {/* Origin country + Material */}
              {(product.origin_country || product.material) && (
                <dl
                  className={`grid grid-cols-2 gap-4 max-sm:grid-cols-1${
                    product.weight || product.length || product.width || product.height
                      ? 'border-apple-divider-soft border-t pt-4'
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
                    hasLogistics ? 'border-apple-divider-soft border-t pt-4' : ''
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

        {/* ── SECTION 4: Variants table ── */}
        <SectionCard>
          <SectionHeader icon={Layers} title={`Варианты товара${variants.length ? ` (${variants.length})` : ''}`} />

          {variants.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-apple-hairline text-apple-ink-muted-48 border-b text-[11px] font-semibold tracking-wider uppercase">
                    <th className="px-3 py-2.5">Вариант</th>
                    <th className="px-3 py-2.5">Количество (Остаток)</th>
                    <th className="px-3 py-2.5">Цена</th>
                    <th className="px-3 py-2.5">Артикул (SKU)</th>
                  </tr>
                </thead>
                <tbody className="divide-apple-divider-soft divide-y text-[13px]">
                  {variants.map((variant) => {
                    const price = variant.prices?.[0]
                    const qty = variant.inventory_quantity ?? 0
                    return (
                      <tr key={variant.id} className="hover:bg-apple-canvas-parchment/50 transition-colors">
                        <td className="text-apple-ink px-3 py-3 font-semibold">{variant.title}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {qty > 0 ? (
                            <span className="rounded-apple-pill inline-flex items-center gap-1 border border-green-200 bg-green-50 px-2.5 py-0.5 text-[12px] font-medium text-green-700">
                              <span className="size-1.5 rounded-full bg-green-500" />
                              {qty} шт.
                            </span>
                          ) : (
                            <span className="rounded-apple-pill inline-flex items-center gap-1 border border-red-200 bg-red-50 px-2.5 py-0.5 text-[12px] font-medium text-red-600">
                              <span className="size-1.5 rounded-full bg-red-500" />0 шт. (Нет в наличии)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {price ? (
                            <span className="text-apple-ink font-medium">
                              {formatPrice(price.amount, price.currency_code)}
                            </span>
                          ) : (
                            <EmptyValue />
                          )}
                        </td>
                        <td className="px-3 py-3">
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
            <div className="bg-apple-canvas-parchment border-apple-hairline rounded-apple-md flex min-h-24 items-center justify-center border p-4 text-center">
              <p className="text-apple-caption text-apple-ink-muted-48">Варианты для этого товара ещё не добавлены.</p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
