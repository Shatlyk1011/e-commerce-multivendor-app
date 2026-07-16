import React, { useEffect, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { medusa } from '@/lib/medusa'

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface ProductCategory {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
  parent_category?: ProductCategory | null
  category_children?: ProductCategory[]
}

export function CategorySelector({ value, onChange, placeholder }: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [browsePath, setBrowsePath] = useState<ProductCategory[]>([])

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch('')
      setDebouncedSearch('')
      setParentId(null)
      setBrowsePath([])
    }
  }, [open])

  // Query 1: Browse active category children
  const { data: browseCategories, isLoading: isBrowseLoading } = useQuery({
    queryKey: ['categories-browse', parentId],
    queryFn: async () => {
      const response = await medusa.store.category.list({
        parent_category_id: parentId || null,
        fields: 'id,name,handle,parent_category_id,*category_children',
      })
      return response.product_categories as ProductCategory[]
    },
    enabled: open && !debouncedSearch,
  })

  // Query 2: Search categories by query text
  const { data: searchCategories, isLoading: isSearchLoading } = useQuery({
    queryKey: ['categories-search', debouncedSearch],
    queryFn: async () => {
      const response = await medusa.store.category.list({
        q: debouncedSearch,
        fields: 'id,name,handle,parent_category_id,*parent_category,*category_children',
      })
      return response.product_categories as ProductCategory[]
    },
    enabled: open && !!debouncedSearch,
  })

  // Query 3: Selected category details
  const { data: selectedCategory } = useQuery({
    queryKey: ['category-details', value],
    queryFn: async () => {
      const response = await medusa.store.category.retrieve(value, {
        fields: 'id,name,handle,parent_category_id,*parent_category',
      })
      return response.product_category as ProductCategory
    },
    enabled: !!value,
  })

  // Helper to construct full category path
  const getCategoryPath = (cat: ProductCategory): string => {
    const pathList: string[] = [cat.name]
    let current = cat.parent_category
    while (current) {
      pathList.unshift(current.name)
      current = current.parent_category
    }
    return pathList.join(' > ')
  }

  // Highlight search matches
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="rounded-xs bg-yellow-100 px-0.5 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    )
  }

  const handleBrowseDown = (category: ProductCategory, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setParentId(category.id)
    setBrowsePath((prev) => [...prev, category])
  }

  const handleBrowseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newPath = [...browsePath]
    newPath.pop()
    setBrowsePath(newPath)
    setParentId(newPath.length > 0 ? newPath[newPath.length - 1].id : null)
  }

  // Filter search results to only return leaf categories (no children)
  const leafSearchResults = useMemo(() => {
    if (!searchCategories) return []
    return searchCategories.filter((cat) => !cat.category_children || cat.category_children.length === 0)
  }, [searchCategories])

  const triggerText = selectedCategory ? getCategoryPath(selectedCategory) : placeholder || 'Выберите категорию...'

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val)
      }}
    >
      <div className="relative w-full">
        {/* Combobox Trigger Input */}
        <ComboboxInput
          placeholder={triggerText}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
        />

        <ComboboxContent className="bg-popover text-popover-foreground mt-1 w-full min-w-[300px] rounded-md border p-1 shadow-md">
          <ComboboxList className="no-scrollbar max-h-60 overflow-y-auto">
            {debouncedSearch ? (
              /* SEARCH RESULTS VIEW */
              isSearchLoading ? (
                <div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Поиск категорий...
                </div>
              ) : leafSearchResults.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">Категории не найдены.</div>
              ) : (
                leafSearchResults.map((cat) => (
                  <ComboboxItem
                    key={cat.id}
                    value={cat.id}
                    className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm"
                  >
                    <span className="truncate">{highlightMatch(getCategoryPath(cat), debouncedSearch)}</span>
                  </ComboboxItem>
                ))
              )
            ) : (
              /* BROWSE FOLDER VIEW */
              <div>
                {/* Back button */}
                {browsePath.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBrowseUp}
                    className="text-foreground bg-muted/50 hover:bg-muted border-border mb-1 flex w-full items-center gap-1 border-b px-2 py-1.5 text-left text-xs font-semibold"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Назад ({browsePath[browsePath.length - 1].name})
                  </button>
                )}

                {isBrowseLoading ? (
                  <div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </div>
                ) : !browseCategories || browseCategories.length === 0 ? (
                  <div className="text-muted-foreground py-6 text-center text-sm">Категории отсутствуют.</div>
                ) : (
                  browseCategories.map((cat) => {
                    const hasChildren = cat.category_children && cat.category_children.length > 0

                    if (hasChildren) {
                      // Subcategory (has children) - render as clickable button to navigate down
                      return (
                        <div
                          key={cat.id}
                          onClick={(e) => handleBrowseDown(cat, e)}
                          className="hover:bg-accent hover:text-accent-foreground text-foreground flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm"
                        >
                          <span className="truncate">{cat.name}</span>
                          <ChevronRight className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
                        </div>
                      )
                    }

                    // Leaf category (no children) - render as ComboboxItem to trigger select
                    return (
                      <ComboboxItem
                        key={cat.id}
                        value={cat.id}
                        className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm"
                      >
                        <span className="truncate">{cat.name}</span>
                      </ComboboxItem>
                    )
                  })
                )}
              </div>
            )}
          </ComboboxList>
        </ComboboxContent>
      </div>
    </Combobox>
  )
}
