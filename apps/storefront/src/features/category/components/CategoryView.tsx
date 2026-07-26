'use client'
import { Fragment, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ChevronRight } from 'lucide-react'

import { ProductCard } from '@/features/home/components/ProductCard'
import { useProductReviewSummaries } from '@/features/reviews/api/queries'

import { useCategories, useProductsByCategory } from '../api/queries'
import { CategoryTreeNode } from '../api/types'
import { findCategoryInTree, findCategoryPath, formatPrice, getProductWord } from '../utils'
import { CategorySidebar } from './CategorySidebar'

const PAGE_SIZE = 20

interface CategoryViewProps {
  categoryId?: string
}

export function CategoryView({ categoryId }: CategoryViewProps) {
  const router = useRouter()
  const [page, setPage] = useState(0)

  // Fetch all root categories with full tree
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    parent_category_id: null,
  })

  const categories = categoriesData ?? []

  // Derive selected category from the full tree using props category ID
  const selectedCategory = useMemo(() => {
    if (!categoriesData || !categoryId) return null
    return findCategoryInTree(categoriesData, categoryId)
  }, [categoriesData, categoryId])

  // Fetch products for the derived category ID
  const { data: productsData, isLoading: productsLoading } = useProductsByCategory({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    category_id: selectedCategory?.id,
  })

  const products = productsData?.products ?? []
  const { data: reviewSummaries } = useProductReviewSummaries(products.map((product) => product.id))
  const totalCount = productsData?.count ?? 0
  const hasMore = (page + 1) * PAGE_SIZE < totalCount

  // Build the path from tree root down to selected category
  const categoryPath = useMemo(() => {
    if (!categoriesData || !categoryId) return []
    return findCategoryPath(categoriesData, categoryId) ?? []
  }, [categoriesData, categoryId])

  const handleCategorySelect = (category: CategoryTreeNode) => {
    setPage(0)
    if (!category.id) {
      router.push('/category', { scroll: false })
    } else {
      router.push(`/category/${category.id}`, { scroll: false })
    }
  }

  return (
    <main className="bg-apple-canvas text-apple-ink min-h-screen antialiased">
      <div className="custom-container py-6">
        {/* Breadcrumb Row */}
        <div className="text-apple-ink-muted-48 mb-6 flex flex-wrap items-center gap-1.5 text-[13px]">
          <Link href="/" className="hover:text-apple-primary cursor-pointer transition-colors">
            Главная
          </Link>
          <ChevronRight className="size-3.5 flex-shrink-0" strokeWidth={2.5} />

          <Link href="/category" className="hover:text-apple-primary cursor-pointer transition-colors">
            Все категории
          </Link>

          {categoryPath.map((crumb, idx) => {
            const isLast = idx === categoryPath.length - 1
            return (
              <Fragment key={crumb.id}>
                <ChevronRight className="size-3.5 flex-shrink-0" strokeWidth={2.5} />
                {isLast ? (
                  <span className="text-apple-ink font-semibold">{crumb.name}</span>
                ) : (
                  <Link
                    href={`/category/${crumb.id}`}
                    className="hover:text-apple-primary cursor-pointer transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </Fragment>
            )
          })}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-56 flex-shrink-0 md:block">
            <div className="sticky top-4">
              {categoriesLoading ? (
                <div className="animate-pulse space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-apple-sm bg-apple-canvas-parchment h-7" />
                  ))}
                </div>
              ) : (
                <CategorySidebar
                  categories={categories}
                  selectedId={selectedCategory?.id}
                  onSelect={handleCategorySelect}
                />
              )}
            </div>
          </aside>

          {/* Product Grid & Main Area */}
          <div className="min-w-0 flex-1">
            {/* Page Title */}
            <h1 className="font-heading text-apple-ink text-[28px] font-bold tracking-tight">
              {selectedCategory?.name ?? 'Каталог'}
            </h1>

            {/* Total Count */}
            {!productsLoading && products.length > 0 && (
              <p className="text-apple-ink-muted-48 mt-1 mb-4 text-[13px] select-none">
                {formatPrice(totalCount)} {getProductWord(totalCount)}
              </p>
            )}

            {/* Horizontal Subcategory Chips */}
            {/* {selectedCategory?.category_children && selectedCategory.category_children.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
                {selectedCategory.category_children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.id}`}
                    className="bg-apple-canvas-parchment text-apple-ink-muted-80 hover:bg-apple-hairline/60 hover:text-apple-ink px-4 py-2 text-[13px] font-normal rounded-apple-sm transition-all cursor-pointer whitespace-nowrap border border-apple-divider-soft"
                  >
                    {child.name}12123123
                  </Link>
                ))}
              </div>
            )} */}

            {/* Sort Dropdown */}
            {!productsLoading && products.length > 0 && (
              <div className="text-apple-ink-muted-80 mb-6 flex items-center gap-1.5 text-[13px] font-normal select-none">
                <span>Сначала показывать:</span>
                <button className="text-apple-ink hover:text-apple-primary flex cursor-pointer items-center gap-0.5 font-semibold transition-colors focus:outline-none">
                  Популярные
                  <svg className="size-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content States */}
            {productsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-apple-lg bg-apple-canvas-parchment border-apple-hairline h-80 animate-pulse border"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-apple-ink-muted-48 flex flex-col items-center justify-center py-20">
                <span className="mb-3 text-4xl">📦</span>
                <p className="text-[15px]">Товары не найдены</p>
                <p className="mt-1 text-[13px]">
                  {selectedCategory ? 'В этой категории пока нет товаров' : 'Выберите категорию слева'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      reviewSummary={reviewSummaries?.summaries[product.id]}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalCount > PAGE_SIZE && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="rounded-apple-sm border-apple-hairline hover:bg-apple-canvas-parchment cursor-pointer border px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Назад
                    </button>
                    <span className="text-apple-ink-muted-48 text-[13px]">
                      {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} из {totalCount}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasMore}
                      className="rounded-apple-sm border-apple-hairline hover:bg-apple-canvas-parchment cursor-pointer border px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Далее
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
