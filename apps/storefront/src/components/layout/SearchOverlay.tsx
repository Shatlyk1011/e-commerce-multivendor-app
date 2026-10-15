'use client'

import { Clock, X } from 'lucide-react'

import { useSearchStore } from '@/store/use-search-store'

interface SearchOverlayProps {
  onSelectQuery: (query: string) => void
}

export default function SearchOverlay({ onSelectQuery }: SearchOverlayProps) {
  const history = useSearchStore((state) => state.history)
  const clearHistory = useSearchStore((state) => state.clearHistory)
  const removeHistoryItem = useSearchStore((state) => state.removeHistoryItem)

  const handleQueryClick = (q: string) => {
    onSelectQuery(q)
  }

  return (
    <div
      className="bg-apple-canvas rounded-apple-lg border-apple-hairline animate-in fade-in slide-in-from-top-2 absolute top-full left-0 z-50 mt-2 flex h-[min(70dvh,520px)] w-full flex-col overflow-hidden border shadow-xl duration-150 lg:left-1/2 lg:h-[400px] lg:w-[720px] lg:-translate-x-1/2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-apple-canvas-parchment/30 flex h-full w-full flex-col p-4 lg:p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-heading text-apple-ink text-[15px] font-semibold">История</span>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-apple-primary hover:text-apple-primary-focus cursor-pointer text-[12px] font-semibold transition-colors duration-100 active:scale-95"
            >
              Очистить
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-apple-ink-muted-48 flex flex-1 flex-col items-center justify-center px-4 text-center text-[13px]">
            <Clock className="mb-2 size-8 stroke-1 opacity-50" />
            <p>История поиска пуста</p>
          </div>
        ) : (
          <ul className="flex-1 scrollbar-thin space-y-1.5 overflow-y-auto pr-1">
            {history.map((item, idx) => (
              <li
                key={`${item}-${idx}`}
                className="group rounded-apple-sm hover:bg-apple-canvas-parchment flex cursor-pointer items-center justify-between px-3 py-2 transition-colors duration-100"
                onClick={() => handleQueryClick(item)}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Clock className="text-apple-ink-muted-48 size-4 shrink-0" />
                  <span className="text-apple-ink-muted-80 group-hover:text-apple-primary truncate text-[13px] font-medium">
                    {item}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeHistoryItem(item)
                  }}
                  className="hover:bg-apple-divider-soft rounded-apple-full text-apple-ink-muted-48 hover:text-apple-ink cursor-pointer p-0.5 opacity-0 transition-all group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
