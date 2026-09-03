import type { Metadata } from 'next'

import CategoryRootClient from './CategoryRootClient'

export const metadata: Metadata = {
  title: 'Каталог товаров',
  description: 'Каталог товаров Bugday: выбирайте товары по категориям и покупайте у проверенных продавцов.',
  alternates: { canonical: '/category' },
}
export default function CategoryPage() {
  return <CategoryRootClient />
}
