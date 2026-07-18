'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

import Link from 'next/link'

import type { VendorProduct, VendorProductsResponse } from '@dtc/api-contracts'
import { ArrowRight, Loader2, Plus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { medusa } from '@/lib/medusa'

export default function ProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await medusa.client.fetch<VendorProductsResponse>('/vendors/products')
        setProducts(response.products || [])
      } catch (err: any) {
        console.error('Failed to load products:', err)
        toast.error('Ошибка загрузки товаров', {
          description: err.message || 'Не удалось загрузить ваши товары.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-apple-canvas-parchment flex h-[calc(100vh-7rem)] w-full flex-col items-center justify-center">
        <Loader2 className="text-apple-primary size-8 animate-spin" />
        <p className="text-apple-ink-muted-48 mt-4 text-[15px] font-medium">Загрузка товаров...</p>
      </div>
    )
  }

  return (
    <div className="bg-apple-canvas-parchment min-h-[calc(100vh-3.5rem)] p-8 max-md:p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-apple-hairline mb-8 flex items-center justify-between gap-6 border-b pb-6 max-sm:gap-4">
          <div>
            <h1 className="text-apple-display-md text-apple-ink font-semibold tracking-tight">Товары</h1>
            <p className="text-apple-caption text-apple-ink-muted-48 mt-1">
              Управляйте ассортиментом вашего магазина, добавляйте новые позиции и следите за запасами.
            </p>
          </div>
          <Link href="/dashboard/products/create">
            <Button className="shadow-xs active:scale-[0.98]">
              <Plus className="mr-1.5 size-4" />
              Добавить товар
            </Button>
          </Link>
        </div>

        {/* Product Grid / Empty State */}
        {products.length === 0 ? (
          <div className="bg-apple-canvas border-apple-hairline rounded-apple-lg border p-16 text-center max-md:p-8">
            <div className="bg-apple-canvas-parchment border-apple-hairline mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border shadow-xs">
              <ShoppingBag className="text-apple-ink-muted-48 size-7" />
            </div>
            <h2 className="text-apple-ink mb-2 text-[21px] font-semibold tracking-tight">У вас пока нет товаров</h2>
            <p className="text-apple-body text-apple-ink-muted-48 mx-auto mb-8 max-w-md">
              Создайте свои первые позиции товаров для продажи на платформе. Покупатели смогут увидеть их в каталоге
              сразу после модерации.
            </p>
            <Link href="/dashboard/products/create">
              <Button variant="default" className="shadow-xs">
                Создать товар
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {products.map((product) => {
              // Extract a default price if available
              const prices = product.variants?.[0]?.prices
              const priceText =
                prices && prices.length > 0
                  ? `${prices[0].amount.toLocaleString()} ${prices[0].currency_code.toUpperCase()}`
                  : 'Цена не указана'

              return (
                <div
                  key={product.id}
                  className="bg-apple-canvas border-apple-hairline rounded-apple-lg group hover:border-apple-primary/30 flex flex-col overflow-hidden border transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="bg-apple-canvas-parchment border-apple-hairline relative flex aspect-square items-center justify-center overflow-hidden border-b p-6">
                    {product.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-102"
                      />
                    ) : (
                      <ShoppingBag className="text-apple-ink-muted-48 size-12 opacity-30" />
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`rounded-apple-pill border px-2.5 py-0.5 text-[11px] font-semibold ${
                          product.status === 'published'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : product.status === 'draft'
                              ? 'bg-apple-canvas-parchment text-apple-ink-muted-48 border-apple-hairline'
                              : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {product.status === 'published'
                          ? 'Опубликован'
                          : product.status === 'draft'
                            ? 'Черновик'
                            : product.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="text-apple-ink group-hover:text-apple-primary line-clamp-1 text-[17px] font-semibold transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-apple-ink-muted-48 mt-1 line-clamp-2 min-h-[2.25rem] text-[13px]">
                        {product.description || 'Нет описания.'}
                      </p>
                    </div>

                    <div className="border-apple-divider-soft mt-4 flex items-center justify-between border-t pt-4">
                      <span className="text-apple-ink text-[15px] font-semibold">{priceText}</span>
                      <span className="text-apple-ink-muted-48 text-[12px]">{product.variants?.length || 0} вар.</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
