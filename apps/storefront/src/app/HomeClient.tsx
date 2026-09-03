'use client'

import { useEffect, useMemo, useRef } from 'react'

import { ChevronRight } from 'lucide-react'

import { HOME_PRODUCT_CARD_FIELDS, useInfiniteProducts } from '@/features/home/API'
import { ProductCard } from '@/features/home/components/ProductCard'
import { useProductReviewSummaries } from '@/features/reviews/api/queries'

const REGION_ID = 'reg_01KXGMKV3HG9ZR3WTV828AYM9A'

export default function Home() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteProducts({
    limit: 12,
    order: '-created_at',
    fields: HOME_PRODUCT_CARD_FIELDS,
    region_id: REGION_ID,
  })

  const products = useMemo(() => data?.pages.flatMap((page) => page.products) ?? [], [data])
  const productIds = products.map((product) => product.id)
  const { data: reviewSummaries } = useProductReviewSummaries(productIds)

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '320px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <main className="bg-apple-canvas text-apple-ink custom-container min-h-screen w-full px-4 py-8 antialiased">
      {/* Title Header Section */}
      <div className="group mb-6 flex w-fit cursor-pointer items-center gap-2 select-none">
        <h2 className="font-heading text-apple-ink hover:text-apple-primary text-[22px] font-bold tracking-tight transition-colors">
          Популярное
        </h2>
        <ChevronRight
          className="text-apple-ink-muted-48 group-hover:text-apple-primary size-5.5 transition-colors"
          strokeWidth={2.5}
        />
      </div>

      {isError ? (
        <p className="text-apple-ink-muted-48 py-12 text-center text-[14px]">Не удалось загрузить товары.</p>
      ) : isLoading ? (
        <div className="grid w-full grid-cols-5 gap-x-3 gap-y-5">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-apple-canvas-parchment rounded-apple-lg h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid w-full grid-cols-5 gap-x-3 gap-y-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} reviewSummary={reviewSummaries?.summaries[product.id]} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
      {isFetchingNextPage && <p className="text-apple-ink-muted-48 py-6 text-center text-[13px]">Загрузка товаров…</p>}
    </main>
  )
}
