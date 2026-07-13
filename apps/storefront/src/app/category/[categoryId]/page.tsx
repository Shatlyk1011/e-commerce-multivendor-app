import { fetchCategory } from '@/features/category/api/client'
import { CategoryView } from '@/features/category/components/CategoryView'

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params
  try {
    const category = await fetchCategory(categoryId)
    return {
      title: `${category?.name ?? 'Категория'} | Medusa Marketplace`,
      description:
        category?.description ?? `Купить товары из категории ${category?.name ?? 'Категория'} в нашем маркетплейсе.`,
    }
  } catch (error) {
    return {
      title: 'Каталог | Medusa Marketplace',
      description: 'Просмотр товаров по категориям в Medusa Marketplace.',
    }
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params
  return <CategoryView categoryId={categoryId} />
}
