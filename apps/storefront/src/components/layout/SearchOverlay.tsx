'use client'

import Link from 'next/link'

import { Clock, TrendingUp, X } from 'lucide-react'

import { Spinner } from '@/components/ui/spinner'
import { useProducts } from '@/features/home/API'
import { useSearchStore } from '@/store/use-search-store'

interface SearchOverlayProps {
  onSelectQuery: (query: string) => void
  onClose: () => void
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('ru-RU').format(amount)
}

export default function SearchOverlay({ onSelectQuery, onClose }: SearchOverlayProps) {
  const history = useSearchStore((state) => state.history)
  const clearHistory = useSearchStore((state) => state.clearHistory)
  const removeHistoryItem = useSearchStore((state) => state.removeHistoryItem)

  const { data, isLoading } = useProducts({ limit: 6 })
  const products = data?.products ?? []

  const handleQueryClick = (q: string) => {
    onSelectQuery(q)
  }

  return (
    <div
      className="bg-apple-canvas rounded-apple-lg border-apple-hairline divide-apple-divider-soft animate-in fade-in slide-in-from-top-2 absolute top-full left-1/2 z-50 mt-2 flex h-[400px] w-[720px] -translate-x-1/2 divide-x overflow-hidden border shadow-xl duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Left Panel: Search History */}
      <div className="bg-apple-canvas-parchment/30 flex h-full w-[260px] shrink-0 flex-col p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-heading text-apple-ink text-[15px] font-semibold">История</span>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-apple-primary hover:text-apple-primary-focus cursor-pointer text-[12px] font-semibold transition-colors duration-100 active:scale-95"
            >
              Очистить
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-apple-ink-muted-48 flex flex-1 flex-col items-center justify-center px-4 text-center text-[13px]">
            <Clock className="mb-2 size-8 stroke-1 opacity-50" />
            <p>История поиска пуста</p>
          </div>
        ) : (
          <ul className="flex-1 scrollbar-thin space-y-1.5 overflow-y-auto pr-1">
            {history.map((item, idx) => (
              <li
                key={`${item}-${idx}`}
                className="group rounded-apple-sm hover:bg-apple-canvas-parchment flex cursor-pointer items-center justify-between px-3 py-2 transition-colors duration-100"
                onClick={() => handleQueryClick(item)}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Clock className="text-apple-ink-muted-48 size-4 shrink-0" />
                  <span className="text-apple-ink-muted-80 group-hover:text-apple-primary truncate text-[13px] font-medium">
                    {item}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeHistoryItem(item)
                  }}
                  className="hover:bg-apple-divider-soft rounded-apple-full text-apple-ink-muted-48 hover:text-apple-ink cursor-pointer p-0.5 opacity-0 transition-all group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Panel: Popular Products */}
      <div className="bg-apple-canvas flex h-full flex-1 flex-col p-5">
        <div className="mb-3.5 flex items-center gap-1.5">
          <TrendingUp className="text-apple-primary size-4" />
          <span className="font-heading text-apple-ink text-[15px] font-semibold">Популярные товары</span>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-apple-ink-muted-48 flex flex-1 items-center justify-center text-[13px]">
            Нет популярных товаров
          </div>
        ) : (
          <div className="flex-1 scrollbar-thin overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3 pb-2">
              {products.map((product) => {
                const title = product.title ?? ''
                const image = product.thumbnail ?? product.images?.[0]?.url ?? ''
                const variant = product.variants?.[0]
                const amount = variant?.calculated_price?.calculated_amount ?? 0
                const originalAmount = variant?.calculated_price?.original_amount ?? null

                const discount =
                  originalAmount && amount < originalAmount
                    ? Math.round(((originalAmount - amount) / originalAmount) * 100)
                    : null

                const price = `${formatPrice(amount)} тмт`
                const originalPrice = originalAmount ? `${formatPrice(originalAmount)} тмт` : null

                const stockLeft =
                  (Math.abs(product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 145) + 5

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.handle || product.id}`}
                    onClick={onClose}
                    className="group border-apple-divider-soft/50 rounded-apple-md bg-apple-canvas flex h-full flex-col overflow-hidden border transition-all duration-200 hover:shadow-md active:scale-[0.99]"
                  >
                    {/* Image Area */}
                    <div className="bg-apple-canvas-parchment border-apple-divider-soft/30 relative aspect-[4/3] w-full overflow-hidden border-b">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                        />
                      ) : (
                        <div className="text-apple-ink-muted-48 flex h-full w-full items-center justify-center text-[12px]">
                          Изображение
                        </div>
                      )}

                      {discount && (
                        <span className="bg-destructive text-apple-on-primary rounded-apple-xs absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold shadow-xs">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex min-w-0 flex-1 flex-col p-2.5">
                      {/* Price Section */}
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className="text-apple-primary text-[14px] font-bold">{price}</span>
                        {originalPrice && (
                          <span className="text-apple-ink-muted-48 text-[11px] line-through">{originalPrice}</span>
                        )}
                      </div>

                      {/* Stock Remaining */}
                      <span className="text-destructive mt-1 text-[10px] font-semibold">{stockLeft} шт. осталось</span>

                      {/* Title */}
                      <p className="text-apple-ink-muted-80 group-hover:text-apple-primary mt-1.5 line-clamp-2 text-[11px] leading-snug font-medium transition-colors">
                        {title}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
