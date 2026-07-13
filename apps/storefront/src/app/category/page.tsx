'use client'

import * as React from 'react'

import Link from 'next/link'

import { ChevronRight } from 'lucide-react'

import { useCategories } from '@/features/category/api/queries'
import { CategoryTreeNode } from '@/features/category/api/types'

export default function CategoryRootPage() {
  const { data, isLoading } = useCategories({ parent_category_id: null })

  const categories = (data ?? []) as CategoryTreeNode[]

  return (
    <main className="bg-apple-canvas text-apple-ink min-h-screen antialiased">
      <div className="custom-container py-6">
        <h1 className="font-heading mb-6 text-[28px] font-bold tracking-tight">Каталог</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-apple-lg bg-apple-canvas-parchment border-apple-hairline h-32 animate-pulse border"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group rounded-apple-lg border-apple-hairline bg-apple-canvas hover:border-apple-primary flex flex-col border p-4 transition-all duration-200 hover:shadow-sm"
              >
                <h2 className="text-apple-ink group-hover:text-apple-primary text-[15px] font-semibold transition-colors">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-apple-ink-muted-48 mt-1 line-clamp-2 text-[12px]">{category.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  {category.category_children && category.category_children.length > 0 ? (
                    <span className="text-apple-ink-muted-48 text-[11px]">
                      {category.category_children.length} подкатегорий
                    </span>
                  ) : (
                    <span />
                  )}
                  <ChevronRight
                    className="text-apple-ink-muted-48 group-hover:text-apple-primary size-4 transition-colors"
                    strokeWidth={2.5}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {categories.length === 0 && !isLoading && (
          <div className="text-apple-ink-muted-48 flex flex-col items-center justify-center py-20">
            <span className="mb-3 text-4xl">📂</span>
            <p className="text-[15px]">Категории не найдены</p>
          </div>
        )}
      </div>
    </main>
  )
}
