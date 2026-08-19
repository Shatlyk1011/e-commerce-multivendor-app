import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { fetchProduct, fetchProductVendor } from '@/features/product/api/client'
import { absoluteUrl, jsonLd, siteName } from '@/lib/seo'

import { ProductDetailClient } from './ProductDetailClient'

type Props = { params: Promise<{ id: string }> }

function productPath(product: { handle?: string | null; id: string }) {
  return `/product/${product.handle || product.id}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const product = await fetchProduct(id)
    const description =
      product.description?.replace(/\s+/g, ' ').trim() ||
      `Купить ${product.title} в ${siteName}. Актуальная цена, характеристики и доставка.`
    const path = productPath(product)
    return {
      title: product.title,
      description: description.slice(0, 160),
      alternates: { canonical: path },
      openGraph: {
        type: 'website',
        url: absoluteUrl(path),
        title: product.title,
        description: description.slice(0, 160),
        images: product.thumbnail ? [{ url: product.thumbnail, alt: product.title }] : undefined,
      },
      twitter: { card: 'summary_large_image' },
    }
  } catch {
    return { title: 'Товар не найден', robots: { index: false, follow: true } }
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  let product
  try {
    product = await fetchProduct(id)
  } catch {
    notFound()
  }
  const vendor = await fetchProductVendor(id).catch(() => null)
  const offers = (product.variants ?? []).flatMap((variant) =>
    (variant.prices ?? []).map((price) => ({
      '@type': 'Offer',
      price: price.amount,
      priceCurrency: price.currency_code.toUpperCase(),
      availability:
        variant.inventory_quantity !== undefined && variant.inventory_quantity <= 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: absoluteUrl(productPath(product)),
      sku: variant.sku || undefined,
    })),
  )
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: [product.thumbnail, ...(product.images ?? []).map((image) => image.url)].filter(Boolean),
    sku: product.variants?.[0]?.sku || undefined,
    brand:
      vendor?.store_name || vendor?.name ? { '@type': 'Brand', name: vendor?.store_name || vendor?.name } : undefined,
    offers: offers.length === 1 ? offers[0] : offers.length > 1 ? offers : undefined,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <ProductDetailClient />
    </>
  )
}
