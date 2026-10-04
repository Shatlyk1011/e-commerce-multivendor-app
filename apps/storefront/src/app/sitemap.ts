import type { MetadataRoute } from 'next'

import { fetchCategories } from '@/features/category/api/client'
import { fetchProducts } from '@/features/home/API/client'
import { absoluteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.allSettled([
    fetchProducts({ limit: 100, fields: 'id,handle,updated_at,status' }),
    fetchCategories({ parent_category_id: null, include_descendants_tree: true }),
  ])
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/category'), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/faq'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/become-seller'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/pickup-points'), changeFrequency: 'monthly', priority: 0.5 },
  ]
  if (categories.status === 'fulfilled') {
    const flatten = (items: typeof categories.value): typeof categories.value =>
      items.flatMap((item) => [item, ...flatten(item.category_children ?? [])])
    entries.push(
      ...flatten(categories.value).map((category) => ({
        url: absoluteUrl(`/category/${category.id}`),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    )
  }
  if (products.status === 'fulfilled')
    entries.push(
      ...products.value.products
        .filter((product) => product.status === 'published' && product.handle)
        .map((product) => ({
          url: absoluteUrl(`/product/${product.handle}`),
          lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })),
    )
  return entries
}
