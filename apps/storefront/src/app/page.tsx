'use client'

import { useEffect, useState } from 'react'

import type { HttpTypes } from '@medusajs/types'
import { ChevronRight } from 'lucide-react'

import { useProducts } from '@/features/home/API'
import { ProductCard } from '@/features/home/components/ProductCard'
import { medusa } from '@/lib/medusa'

export default function Home() {
  const { data, isLoading, isError } = useProducts({ limit: 12, order: '-created_at' })

  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  console.log('regions', regions)

  const fn = async () => {
    await medusa.store.region.list().then(({ regions: dataRegions }) => {
      setRegions(dataRegions)
      // setLoading(false)
    })
  }

  useEffect(() => {
    fn()
  }, [])

  // useEffect(() => {
  //   const cartRes = await sdk.client.fetch<HttpTypes.StoreCompleteCartResponse>(
  //     `/store/carts/${id}/complete-vendor`, {
  //       method: "POST",
  //       headers,
  //     })
  //     .then(async (cartRes) => {
  //       const cartCacheTag = await getCacheTag("carts")
  //       revalidateTag(cartCacheTag)
  //       return cartRes
  //     })
  //     .catch(medusaError)
  // }, [])

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
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-apple-lg bg-apple-canvas-parchment border-apple-hairline h-80 animate-pulse border"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-apple-ink-muted-48 text-sm">Не удалось загрузить товары.</p>
      ) : (
        <div className="grid w-full grid-cols-5 gap-4">
          {data?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
