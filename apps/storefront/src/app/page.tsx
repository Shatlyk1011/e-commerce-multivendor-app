import type { Metadata } from 'next'

import { absoluteUrl, jsonLd, siteName } from '@/lib/seo'

import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Маркетплейс в Туркменистане',
  description: 'Покупайте популярные товары у проверенных продавцов с доставкой по Туркменистану.',
  alternates: { canonical: '/' },
}
export default function HomePage() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: absoluteUrl('/'),
    description: 'Маркетплейс с товарами от проверенных продавцов в Туркменистане.',
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organization) }} />
      <HomeClient />
    </>
  )
}
