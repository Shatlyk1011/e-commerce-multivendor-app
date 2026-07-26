import Link from 'next/link'

import type { VendorProduct } from '@dtc/api-contracts'
import { ImageOff, Layers } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { productStatus } from '@/lib/constants'

type ProductItemProps = {
  product: VendorProduct
}

function formatPrice(amount: number, currencyCode: string) {
  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode.toUpperCase()}`
}

export function getProductPriceLabel(product: VendorProduct) {
  const prices = product.variants?.flatMap((variant) => variant.prices ?? []) ?? []

  if (!prices.length) {
    return 'Цена не указана'
  }

  const firstPrice = prices[0]
  const sameCurrencyPrices = prices.filter((price) => price.currency_code === firstPrice.currency_code)
  const amounts = sameCurrencyPrices.map((price) => price.amount)
  const lowestAmount = Math.min(...amounts)
  const highestAmount = Math.max(...amounts)

  if (lowestAmount === highestAmount) {
    return formatPrice(lowestAmount, firstPrice.currency_code)
  }

  return `От ${formatPrice(lowestAmount, firstPrice.currency_code)}`
}

function getVariantLabel(count: number) {
  if (count === 1) return '1 вариант'
  if (count >= 2 && count <= 4) return `${count} варианта`
  return `${count} вариантов`
}

export function ProductItem({ product }: ProductItemProps) {
  const status = productStatus[product.status]
  const variantCount = product.variants?.length ?? 0

  return (
    <article className="bg-apple-canvas border-apple-hairline rounded-apple-lg hover:border-apple-primary/40 overflow-hidden border transition-all duration-200 hover:shadow-xs">
      <Link
        href={`/dashboard/products/${product.id}`}
        className="group focus-visible:ring-apple-primary-focus block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`Открыть товар ${product.title}`}
      >
        <div className="bg-apple-canvas-parchment relative flex aspect-square items-center justify-center overflow-hidden p-8">
          {product.thumbnail ? (
            // The vendor product DTO returns a public MinIO URL.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-103"
            />
          ) : (
            <ImageOff className="text-apple-ink-muted-48 size-12 opacity-35" aria-hidden="true" />
          )}

          <Badge className={`absolute top-4 right-4 border text-[11px] font-medium shadow-none ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        <div className="flex flex-col p-6 pt-4">
          <h2 className="text-apple-body-strong text-apple-ink group-hover:text-apple-primary line-clamp-2 font-semibold transition-colors">
            {product.title}
          </h2>

          <div className="mt-3 flex items-baseline justify-between gap-4">
            <span className="text-apple-ink text-[16px] font-semibold">{getProductPriceLabel(product)}</span>
            <span className="text-apple-ink-muted-48 flex shrink-0 items-center gap-1.5 text-[13px]">
              <Layers className="size-3.5 opacity-70" aria-hidden="true" />
              {getVariantLabel(variantCount)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
