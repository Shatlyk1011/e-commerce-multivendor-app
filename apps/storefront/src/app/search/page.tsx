import { Suspense } from 'react'

import { Spinner } from '@/components/ui/spinner'
import { SearchPageContent } from '@/features/search/components/SearchPageContent'

export const metadata = {
  title: 'Поиск товаров | Medusa Marketplace',
  description: 'Поиск товаров и категорий в маркетплейсе',
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-apple-canvas flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
