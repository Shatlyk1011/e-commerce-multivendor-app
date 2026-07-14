'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import {
  Activity,
  Apple,
  Baby,
  BookOpen,
  Car,
  Compass,
  Folder,
  Footprints,
  Heart,
  Home,
  Pill,
  Plug,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Wrench,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

import { useCategories } from '../../features/category/api/queries'
import { CategoryTreeNode } from '../../features/category/api/types'

interface CatalogMenuProps {
  onClose: () => void
}

// Map root category names to premium Lucide icons
function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase().trim()
  if (normalized.includes('электроника')) return <Smartphone className="size-4.5" />
  if (normalized.includes('одежда')) return <Shirt className="size-4.5" />
  if (normalized.includes('обувь')) return <Footprints className="size-4.5" />
  if (normalized.includes('дом и сад') || normalized.includes('дом') || normalized.includes('дача'))
    return <Home className="size-4.5" />
  if (normalized.includes('детские') || normalized.includes('дети')) return <Baby className="size-4.5" />
  if (normalized.includes('красота') || normalized.includes('здоровье')) return <Sparkles className="size-4.5" />
  if (normalized.includes('техника') || normalized.includes('бытовая')) return <Plug className="size-4.5" />
  if (normalized.includes('спорт') || normalized.includes('отдых')) return <Activity className="size-4.5" />
  if (normalized.includes('ремонт') || normalized.includes('строительство')) return <Wrench className="size-4.5" />
  if (normalized.includes('продукты') || normalized.includes('питание') || normalized.includes('еда'))
    return <Apple className="size-4.5" />
  if (normalized.includes('аптека') || normalized.includes('лекарства')) return <Pill className="size-4.5" />
  if (normalized.includes('животные') || normalized.includes('зоотовары')) return <Heart className="size-4.5" />
  if (normalized.includes('книги')) return <BookOpen className="size-4.5" />
  if (normalized.includes('туризм') || normalized.includes('рыбалка')) return <Compass className="size-4.5" />
  if (normalized.includes('авто')) return <Car className="size-4.5" />
  if (normalized.includes('мебель')) return <Sofa className="size-4.5" />
  return <Folder className="size-4.5" />
}

export default function CatalogMenu({ onClose }: CatalogMenuProps) {
  const { data: categories = [], isLoading } = useCategories({ parent_category_id: null })
  const [activeRootId, setActiveRootId] = useState<string | null>(null)

  // Prevent background scrolling when catalog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  console.log('activeRootId', activeRootId)

  // Auto-select the first category as active when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeRootId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveRootId(categories[0].id)
    }
  }, [categories, activeRootId])

  const activeCategory = categories.find((c) => c.id === activeRootId)

  if (isLoading) {
    return (
      <div
        onClick={onClose}
        className="animate-in fade-in fixed inset-x-0 top-[106px] bottom-0 z-30 flex justify-center bg-black/40 backdrop-blur-xs duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-apple-canvas border-apple-hairline rounded-b-apple-lg flex h-[580px] w-full max-w-[1240px] items-center justify-center border-b shadow-xl"
        >
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClose}
      className="animate-in fade-in fixed inset-x-0 top-[106px] bottom-0 z-30 flex justify-center bg-black/40 backdrop-blur-xs duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-apple-canvas border-apple-hairline rounded-b-apple-lg flex h-[580px] w-full max-w-[1240px] overflow-hidden border-b shadow-xl"
      >
        {/* Left Sidebar: Root Categories (Level 0) */}
        <div className="bg-apple-canvas-parchment border-apple-divider-soft w-[260px] shrink-0 overflow-y-auto border-r p-3">
          <ul className="flex flex-col gap-1">
            {categories.map((category) => {
              const isActive = category.id === activeRootId
              return (
                <li key={category.id}>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveRootId(category.id)}
                    className={cn(
                      'w-full justify-start gap-3 px-4 py-2.5 text-[14px] font-medium active:scale-98',
                      isActive
                        ? 'bg-apple-primary/10 text-apple-primary hover:bg-apple-primary/15 hover:text-apple-primary font-semibold'
                        : 'text-apple-ink-muted-80 hover:bg-apple-canvas hover:text-apple-ink',
                    )}
                  >
                    <span className={isActive ? 'text-apple-primary' : 'text-apple-ink-muted-48'}>
                      {getCategoryIcon(category.name)}
                    </span>
                    <span className="truncate">{category.name}</span>
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right Content: Subcategories (Level 1) & Children (Level 2) */}
        <div className="bg-apple-canvas flex-1 overflow-y-auto p-8">
          {activeCategory ? (
            <div>
              <Link
                href={`/category/${activeCategory.id}`}
                onClick={onClose}
                className="text-apple-ink hover:text-apple-primary font-heading mb-6 block text-[28px] font-semibold tracking-tight transition-colors"
              >
                {activeCategory.name}
              </Link>

              {activeCategory.category_children && activeCategory.category_children.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-8 gap-y-10">
                  {activeCategory.category_children.map((subcat) => (
                    <SubCategoryColumn key={subcat.id} category={subcat} onClose={onClose} />
                  ))}
                </div>
              ) : (
                <div className="text-apple-ink-muted-48 flex h-64 items-center justify-center text-[14px]">
                  В этой категории пока нет товаров
                </div>
              )}
            </div>
          ) : (
            <div className="text-apple-ink-muted-48 flex h-full items-center justify-center text-[14px]">
              Выберите категорию для просмотра
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Collapsible column for Level 1 subcategories to show/hide Level 2 children
function SubCategoryColumn({ category, onClose }: { category: CategoryTreeNode; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const items = category.category_children ?? []

  const visibleItems = expanded ? items : items.slice(0, 5)
  const hasMore = items.length > 5

  return (
    <div className="flex flex-col">
      <Link
        href={`/category/${category.id}`}
        onClick={onClose}
        className="text-apple-ink hover:text-apple-primary font-heading mb-3 block text-[15px] font-semibold tracking-tight transition-colors"
      >
        {category.name}
      </Link>
      <ul className="flex flex-col gap-2">
        {visibleItems.map((item) => (
          <li key={item.id}>
            <Link
              href={`/category/${item.id}`}
              onClick={onClose}
              className="text-apple-ink-muted-80 hover:text-apple-primary text-[13px] font-normal transition-colors"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button
          variant="link"
          size="xs"
          onClick={() => setExpanded(!expanded)}
          className="text-apple-primary hover:text-apple-primary-focus mt-2 h-auto cursor-pointer p-0 font-semibold active:scale-95"
        >
          {expanded ? 'Свернуть' : `Еще ${items.length - 5}`}
        </Button>
      )}
    </div>
  )
}
