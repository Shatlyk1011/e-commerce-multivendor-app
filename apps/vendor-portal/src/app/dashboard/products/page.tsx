'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import type { VendorProduct, VendorProductsResponse } from '@dtc/api-contracts'
import { ArrowRight, Loader2, Plus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ProductItem } from '@/features/products/components/ProductItem'
import { medusa } from '@/lib/medusa'

export default function ProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await medusa.client.fetch<VendorProductsResponse>('/vendors/products')
        setProducts(response.products || [])
      } catch (error) {
        console.error('Failed to load products:', error)
        toast.error('Ошибка загрузки товаров', {
          description: error instanceof Error ? error.message : 'Не удалось загрузить ваши товары.',
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
      <div className="mx-auto max-w-7xl">
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
              <Plus className="size-4" />
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
          <div className="max-xs:grid-cols-1 grid grid-cols-4 gap-4 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-md:grid-cols-2">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
