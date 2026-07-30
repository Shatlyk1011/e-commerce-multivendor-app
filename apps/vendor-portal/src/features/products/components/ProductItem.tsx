import Link from 'next/link'

import type { VendorProduct } from '@dtc/api-contracts'
import { ImageOff, Layers, Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { productStatus } from '@/lib/constants'

type ProductItemProps = {
  product: VendorProduct
}

function formatPrice(amount: number, currencyCode: string) {
  return `${amount} ${currencyCode.toUpperCase()}`
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
    <Card className="group border-apple-hairline/40 bg-apple-canvas rounded-apple-lg hover:border-apple-primary/40 relative flex h-full flex-col justify-between gap-0 border p-1 transition-all duration-200 hover:shadow-xs">
      <Link
        href={`/dashboard/products/${product.id}`}
        className="focus-visible:ring-apple-primary-focus flex flex-1 flex-col focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`Открыть товар ${product.title}`}
      >
        {/* Product Image Container */}
        <div className="bg-apple-canvas-parchment relative flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-[16px] transition-all duration-200 ease-in-out group-hover:opacity-95">
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-104"
            />
          ) : (
            <ImageOff className="text-apple-ink-muted-48 size-12 opacity-35" aria-hidden="true" />
          )}

          <Badge
            className={`absolute top-2.5 right-2.5 z-10 border text-[11px] font-medium shadow-none ${status.className}`}
          >
            {status.label}
          </Badge>
        </div>

        {/* Product Details inside CardContent */}
        <CardContent className="mt-2.5 flex flex-col px-1 pb-0">
          {/* Pricing row */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-apple-ink font-sans text-[16px] font-bold">{getProductPriceLabel(product)}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-apple-ink font-text group-hover:text-apple-primary mt-2 line-clamp-2 min-h-[32px] text-[13px] leading-tight font-medium transition-colors">
            {product.title}
          </h3>

          {/* Variants count */}
          <div className="text-apple-ink-muted-48 mt-1 flex items-center gap-1.5 text-[11px]">
            <Layers className="size-3.5 opacity-70" aria-hidden="true" />
            <span className="font-sans font-medium">{getVariantLabel(variantCount)}</span>
          </div>
        </CardContent>
      </Link>

      {/* Action Footer */}
      <CardFooter className="mt-3 rounded-none border-t-0 bg-transparent p-0 pb-2">
        <Link href={`/dashboard/products/${product.id}`} className="w-full">
          <Button variant="default" size="sm" className="w-full cursor-pointer font-semibold">
            <Pencil className="size-3.5" />
            <span>Редактировать</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
