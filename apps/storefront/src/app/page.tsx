'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'

import { HOME_PRODUCT_CARD_FIELDS, useProducts } from '@/features/home/API'
import { ProductCard } from '@/features/home/components/ProductCard'
import { useProductReviewSummaries } from '@/features/reviews/api/queries'

const REGION_ID = 'reg_01KXGMKV3HG9ZR3WTV828AYM9A'

export default function Home() {
  const { data, isLoading, isError } = useProducts({
    limit: 12,
    order: '-created_at',
    fields: HOME_PRODUCT_CARD_FIELDS,
    region_id: REGION_ID,
  })
  const productIds = data?.products.map((product) => product.id) ?? []
  const { data: reviewSummaries } = useProductReviewSummaries(productIds)

  console.log('reviewSummaries', reviewSummaries)
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

      {/* Loading state placeholders */}
      <div className="grid w-full grid-cols-5 gap-x-3 gap-y-5">
        {data?.products.map((product) => (
          <ProductCard key={product.id} product={product} reviewSummary={reviewSummaries?.summaries[product.id]} />
        ))}
      </div>
    </main>
  )
}
