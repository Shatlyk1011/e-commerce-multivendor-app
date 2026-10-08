'use client'

import { useMemo, useState } from 'react'

import { ChevronLeft, Info, Search } from 'lucide-react'

import { CategoryTreeNode } from '@/features/category/api/types'
import { findCategoryInTree, findCategoryPath } from '@/features/category/utils'
import { cn } from '@/lib/utils'

interface SearchFiltersProps {
  categories: CategoryTreeNode[]
  selectedCategoryId: string | null
  onSelectCategory: (id: string | null) => void
}

// Popular food brands to populate the Brand filter
const MOCK_BRANDS = ['Heinz', 'Barilla', 'Nestle', 'Filippo Berio', 'Monini', 'Knorr', 'Makfa', "Uncle Ben's"]

export function SearchFilters({ categories, selectedCategoryId, onSelectCategory }: SearchFiltersProps) {
  // Price range UI states
  const [minPrice, setMinPrice] = useState('2')
  const [maxPrice, setMaxPrice] = useState('68')

  // Brand list UI states
  const [brandSearch, setBrandSearch] = useState('')
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Heinz']) // Default checked Heinz from sample image

  // Find currently active category details
  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return findCategoryInTree(categories, selectedCategoryId)
  }, [categories, selectedCategoryId])

  // Find parent category to allow "Go Back" action
  const parentCategory = useMemo(() => {
    if (!selectedCategoryId || categories.length === 0) return null
    const path = findCategoryPath(categories, selectedCategoryId)
    if (!path || path.length <= 1) return null
    return path[path.length - 2] // parent is right before target in the path
  }, [categories, selectedCategoryId])

  // Filter brands based on search input
  const filteredBrands = useMemo(() => {
    return MOCK_BRANDS.filter((brand) => brand.toLowerCase().includes(brandSearch.toLowerCase().trim()))
  }, [brandSearch])

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  // Calculate rendering elements for Category Tree
  const renderCategorySection = () => {
    // If no category is selected, render list of top-level categories
    if (!activeCategory) {
      return (
        <div className="flex flex-col gap-2">
          <h4 className="text-apple-ink text-[14px] font-semibold">Категория</h4>
          <ul className="flex flex-col gap-1.5 pl-1">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onSelectCategory(cat.id)}
                  className="text-apple-ink-muted-80 hover:text-apple-primary cursor-pointer text-left text-[13px] font-medium transition-colors"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    // If active category is selected
    const siblingsOrChildren =
      activeCategory.category_children && activeCategory.category_children.length > 0
        ? activeCategory.category_children
        : []

    return (
      <div className="flex flex-col gap-3">
        <h4 className="text-apple-ink text-[14px] font-semibold">Категория</h4>

        {/* Back Link */}
        <button
          onClick={() => onSelectCategory(parentCategory ? parentCategory.id : null)}
          className="text-apple-ink-muted-48 hover:text-apple-primary flex cursor-pointer items-center gap-1 text-[13px] font-medium transition-colors"
        >
          <ChevronLeft className="size-4" />
          <span>{parentCategory ? parentCategory.name : 'Все категории'}</span>
        </button>

        {/* Selected Highlighted Category */}
        <div className="rounded-apple-sm bg-apple-canvas-parchment text-apple-ink px-3 py-2 text-[13px] font-semibold">
          {activeCategory.name}
        </div>

        {/* Subcategories (Indented) */}
        {siblingsOrChildren.length > 0 && (
          <ul className="border-apple-divider-soft flex flex-col gap-2 border-l pl-4">
            {siblingsOrChildren.map((child) => (
              <li key={child.id}>
                <button
                  onClick={() => onSelectCategory(child.id)}
                  className="text-apple-ink-muted-80 hover:text-apple-primary text-left text-[13px] font-normal transition-colors"
                >
                  {child.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // Handle slider state updates
  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), Number(maxPrice) - 1).toString()
    setMinPrice(val)
  }

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), Number(minPrice) + 1).toString()
    setMaxPrice(val)
  }

  return (
    <aside className="border-apple-divider-soft/50 flex w-[240px] shrink-0 flex-col gap-6 border-r pr-4 max-md:w-full max-md:border-r-0 max-md:pr-0">
      {/* Category Selection Tree */}
      <div className="border-apple-divider-soft border-b pb-4">{renderCategorySection()}</div>

      {/* Price filter UI */}
      <div className="border-apple-divider-soft flex flex-col gap-3 border-b pb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-apple-ink text-[14px] font-semibold">Цена</h4>
          <PopoverInfo text="Диапазон цен в Manat (tmt)" />
        </div>

        {/* Dual Range Track (Visual Overlapping Inputs) */}
        <div className="relative flex h-6 items-center px-1">
          {/* Background track */}
          <div className="bg-apple-canvas-parchment absolute right-0 left-0 h-1 rounded-full" />

          {/* Active highlighted range */}
          <div
            className="bg-apple-primary absolute h-1 rounded-full"
            style={{
              left: `${Math.max(0, (Number(minPrice) / 100) * 100)}%`,
              right: `${Math.max(0, 100 - (Number(maxPrice) / 100) * 100)}%`,
            }}
          />

          {/* Hidden overlapping inputs */}
          <input
            type="range"
            min="0"
            max="100"
            value={minPrice}
            onChange={handleMinSliderChange}
            className="[&::-webkit-slider-thumb]:bg-apple-primary [&::-webkit-slider-thumb]:border-apple-canvas pointer-events-none absolute h-1 w-full appearance-none bg-transparent outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-md"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={maxPrice}
            onChange={handleMaxSliderChange}
            className="[&::-webkit-slider-thumb]:bg-apple-primary [&::-webkit-slider-thumb]:border-apple-canvas pointer-events-none absolute h-1 w-full appearance-none bg-transparent outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>

        {/* Min / Max inputs */}
        <div className="flex items-center gap-2">
          <div className="border-apple-hairline rounded-apple-sm bg-apple-canvas focus-within:border-apple-primary flex flex-1 items-center border px-2.5 py-1">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="text-apple-ink w-full border-none p-0 font-sans text-[13px] outline-none focus:ring-0"
            />
          </div>
          <div className="border-apple-hairline rounded-apple-sm bg-apple-canvas focus-within:border-apple-primary flex flex-1 items-center border px-2.5 py-1">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="text-apple-ink w-full border-none p-0 font-sans text-[13px] outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Brand Checklist UI */}
      <div className="flex flex-col gap-3">
        <h4 className="text-apple-ink text-[14px] font-semibold">Бренд</h4>

        {/* Search inline box */}
        <div className="border-apple-hairline rounded-apple-pill bg-apple-canvas focus-within:border-apple-primary relative flex items-center border px-3 py-1">
          <Search className="text-apple-ink-muted-48 mr-1.5 size-3.5" />
          <input
            type="text"
            placeholder="Поиск бренда"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="text-apple-ink placeholder:text-apple-ink-muted-48 w-full border-none p-0 font-sans text-[12px] outline-none focus:ring-0"
          />
        </div>

        {/* Checkbox list */}
        <ul className="flex max-h-48 scrollbar-thin flex-col gap-2.5 overflow-y-auto pr-1">
          {filteredBrands.map((brand) => {
            const isChecked = selectedBrands.includes(brand)
            return (
              <li key={brand} className="flex items-center gap-2.5">
                <button
                  onClick={() => handleBrandToggle(brand)}
                  className={cn(
                    'rounded-apple-xs flex size-4 cursor-pointer items-center justify-center border transition-all duration-100 active:scale-90',
                    isChecked
                      ? 'bg-apple-primary border-apple-primary text-apple-on-primary'
                      : 'border-apple-hairline hover:border-apple-ink-muted-48 bg-apple-canvas',
                  )}
                >
                  {isChecked && (
                    <svg className="size-2.5 fill-current" viewBox="0 0 512 512">
                      <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
                    </svg>
                  )}
                </button>
                <span
                  onClick={() => handleBrandToggle(brand)}
                  className="text-apple-ink-muted-80 hover:text-apple-ink cursor-pointer text-[13px] font-medium"
                >
                  {brand}
                </span>
              </li>
            )
          })}
          {filteredBrands.length === 0 && (
            <span className="text-apple-ink-muted-48 text-[12px] italic">Ничего не найдено</span>
          )}
        </ul>
      </div>
    </aside>
  )
}

// Simple internal helper for displaying info tips
function PopoverInfo({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative flex items-center">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-apple-ink-muted-48 hover:text-apple-primary cursor-pointer"
      >
        <Info className="size-4" />
      </button>
      {show && (
        <div className="rounded-apple-sm border-apple-hairline bg-apple-canvas text-apple-ink absolute right-0 bottom-full z-30 mb-2 w-48 border p-2 font-sans text-[11px] leading-tight font-medium shadow-lg">
          {text}
        </div>
      )}
    </div>
  )
}
