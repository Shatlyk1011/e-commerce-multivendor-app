'use client'

import { useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { ChevronDown, SlidersHorizontal } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCategories } from '@/features/category/api/queries'
import { getProductWord } from '@/features/category/utils'
import { useProducts } from '@/features/home/API'
import { ProductCard } from '@/features/home/components/ProductCard'
import { cn } from '@/lib/utils'

import { SearchFilters } from './SearchFilters'

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'rating'

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Популярные',
  price_asc: 'Дешевле',
  price_desc: 'Дороже',
  rating: 'С высоким рейтингом',
}

const SORT_ORDER_MAP: Record<SortOption, string> = {
  popular: '-created_at',
  price_asc: '',
  price_desc: '',
  rating: '-title',
}

export function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') || ''
  const categoryId = searchParams.get('category_id') || ''

  // Sort UI Option
  const [sortOption, setSortOption] = useState<SortOption>('popular')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Fetch Root Categories (and descendants tree)
  const { data: categories = [] } = useCategories({
    parent_category_id: null,
  })

  // Fetch products matching the q search query and categoryId from Medusa API with sorting
  const {
    data,
    isLoading: isProductsLoading,
    isError,
  } = useProducts({
    q: q || undefined,
    category_id: categoryId || undefined,
    order: SORT_ORDER_MAP[sortOption],
    limit: 40,
  })

  const products = data?.products || []

  // Handle drill down/selection of category from sidebar
  const handleSelectCategory = (catId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (catId) {
      params.set('category_id', catId)
    } else {
      params.delete('category_id')
    }
    router.push(`/search?${params.toString()}`)
  }

  // Loading skeleton grids matching Apple visual aesthetics
  const renderSkeletons = () => (
    <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-apple-lg bg-apple-canvas-parchment border-apple-hairline h-[360px] animate-pulse border"
        />
      ))}
    </div>
  )

  const hasQuery = q.trim().length > 0
  const totalCount = products.length

  return (
    <main className="bg-apple-canvas text-apple-ink custom-container min-h-screen w-full px-4 py-8 antialiased">
      {/* Title / Description area */}
      <div className="border-apple-divider-soft flex flex-col gap-1 border-b pb-4">
        <h1 className="font-heading text-apple-ink text-[28px] font-bold tracking-tight">
          {hasQuery ? `Результаты поиска по запросу «${q}»` : 'Каталог товаров'}
        </h1>
        <p className="text-apple-ink-muted-48 text-[14px]">
          {isProductsLoading ? 'Загрузка...' : `${totalCount} ${getProductWord(totalCount)}`}
        </p>
      </div>

      {/* Sorting bar & Mobile filters toggles */}
      <div className="mt-4 flex items-center justify-between">
        {/* Mobile Filters toggle */}
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="border-apple-hairline rounded-apple-sm text-apple-ink bg-apple-canvas hover:bg-apple-canvas-parchment flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-[13px] font-semibold transition-all duration-100 active:scale-95 md:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Фильтры
        </button>

        <div className="hidden md:block" />

        {/* Sort drop down selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border-apple-hairline rounded-apple-sm text-apple-ink bg-apple-canvas hover:bg-apple-canvas-parchment flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-[13px] font-semibold transition-all duration-100 outline-none active:scale-95">
              <span>{SORT_LABELS[sortOption]}</span>
              <ChevronDown className="text-apple-ink-muted-48 size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-apple-canvas border-apple-hairline rounded-apple-sm w-48 shadow-lg"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => setSortOption(option)}
                className={cn(
                  'text-apple-ink cursor-pointer px-3 py-2 text-[13px] font-medium transition-colors',
                  sortOption === option
                    ? 'bg-apple-canvas-parchment text-apple-primary font-semibold'
                    : 'hover:bg-apple-canvas-parchment',
                )}
              >
                {SORT_LABELS[option]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Page layout: Sidebar + Main Listing Grid */}
      <div className="mt-6 flex items-start gap-8 max-md:flex-col">
        {/* Sidebar Filters */}
        <div className={cn('shrink-0 max-md:w-full md:block', mobileFiltersOpen ? 'block' : 'max-md:hidden')}>
          <SearchFilters
            categories={categories}
            selectedCategoryId={categoryId || null}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* Product Cards Grid */}
        <div className="w-full flex-1">
          {isProductsLoading ? (
            renderSkeletons()
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-apple-ink-muted-48 text-[15px] font-medium">
                Не удалось загрузить результаты поиска. Попробуйте еще раз.
              </p>
            </div>
          ) : totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <span className="text-[44px]">🔍</span>
              <h3 className="text-apple-ink mt-2 text-[18px] font-semibold">Мы ничего не нашли по вашему запросу</h3>
              <p className="text-apple-ink-muted-48 max-w-sm text-[13px]">
                Попробуйте изменить поисковый запрос, выбрать другую категорию или сбросить фильтры.
              </p>
            </div>
          ) : (
            <div className="max-xs:grid-cols-1 grid grid-cols-4 gap-4 max-xl:grid-cols-3 max-lg:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
