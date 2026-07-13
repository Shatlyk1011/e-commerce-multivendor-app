'use client'

import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

import { CategoryTreeNode } from '../api/types'
import { findCategoryInTree, findCategoryPath } from '../utils'

interface CategorySidebarProps {
  categories: CategoryTreeNode[]
  selectedId?: string | null
  onSelect: (category: CategoryTreeNode) => void
}

export function CategorySidebar({ categories, selectedId, onSelect }: CategorySidebarProps) {
  const selectedCategory = selectedId ? findCategoryInTree(categories, selectedId) : null
  const path = selectedId ? findCategoryPath(categories, selectedId) : null

  const hasSelection = path && path.length > 0
  const immediateParent = hasSelection && path.length > 1 ? path[path.length - 2] : null
  const siblings: CategoryTreeNode[] = hasSelection ? (immediateParent?.category_children ?? categories) : categories

  return (
    <div className="flex w-full flex-col gap-6 font-sans select-none">
      {/* Category Section */}
      <div>
        <h3 className="font-heading text-apple-ink mb-4 text-[16px] font-semibold">Категории</h3>

        <div className="flex flex-col gap-1.5">
          {hasSelection && (
            <>
              {/* Back to all categories */}
              <button
                onClick={() => {
                  onSelect({ id: '' } as CategoryTreeNode)
                }}
                className="text-apple-ink-muted-48 hover:text-apple-ink group flex w-full cursor-pointer items-center gap-1.5 py-1 text-left text-[13px] transition-colors"
              >
                <ChevronLeft className="text-apple-ink-muted-48 group-hover:text-apple-ink size-3.5 transition-colors" />
                <span>Все категории</span>
              </button>

              {/* Back to parents if any */}
              {path.map((parent, idx) => {
                if (idx === path.length - 1) return null
                return (
                  <button
                    key={parent.id}
                    onClick={() => onSelect(parent)}
                    className="text-apple-ink-muted-48 hover:text-apple-ink group flex w-full cursor-pointer items-center gap-1.5 py-1 pl-2 text-left text-[13px] transition-colors"
                  >
                    <ChevronLeft className="text-apple-ink-muted-48 group-hover:text-apple-ink size-3.5 transition-colors" />
                    <span>{parent.name}</span>
                  </button>
                )
              })}
            </>
          )}

          {/* List of active siblings/roots */}
          <div className={cn('mt-1 flex flex-col gap-1', hasSelection && 'pl-4')}>
            {siblings.map((sibling) => {
              const isSelected = sibling.id === selectedId
              if (isSelected) {
                return (
                  <div
                    key={sibling.id}
                    className="text-apple-ink bg-apple-canvas-parchment rounded-apple-sm border-apple-divider-soft w-full border px-3 py-2 text-left text-[13.5px] font-semibold"
                  >
                    {sibling.name}
                  </div>
                )
              }

              return (
                <button
                  key={sibling.id}
                  onClick={() => onSelect(sibling)}
                  className="text-apple-ink-muted-80 hover:text-apple-primary w-full cursor-pointer py-1.5 text-left text-[13px] font-normal transition-all hover:pl-1"
                >
                  {sibling.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Price Filter Section */}
      <div className="border-apple-divider-soft border-t pt-5">
        <h3 className="font-heading text-apple-ink mb-3 text-[14px] font-semibold">Цена, сум</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="text-apple-ink-muted-48 absolute top-1/2 left-2.5 -translate-y-1/2 text-[12px] select-none">
              от
            </span>
            <input
              type="number"
              placeholder="0"
              className="bg-apple-canvas border-apple-hairline rounded-apple-sm text-apple-ink placeholder-apple-ink-muted-48 focus:border-apple-primary w-full [appearance:textfield] border py-1.5 pr-2 pl-7 text-[13px] transition-colors focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <div className="relative flex-1">
            <span className="text-apple-ink-muted-48 absolute top-1/2 left-2.5 -translate-y-1/2 text-[12px] select-none">
              до
            </span>
            <input
              type="number"
              placeholder="100 000"
              className="bg-apple-canvas border-apple-hairline rounded-apple-sm text-apple-ink placeholder-apple-ink-muted-48 focus:border-apple-primary w-full [appearance:textfield] border py-1.5 pr-2 pl-7 text-[13px] transition-colors focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
