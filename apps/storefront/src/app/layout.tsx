import type { Metadata } from 'next'

import { AppProviders } from '@/components/providers/AppProviders'
import { siteName, siteUrl } from '@/lib/seo'

import '../../public/fonts.css'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — маркетплейс в Туркменистане`, template: `%s | ${siteName}` },
  description: 'Покупайте товары у проверенных продавцов с удобной доставкой по Туркменистану.',
  applicationName: siteName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName,
    title: `${siteName} — маркетплейс в Туркменистане`,
    description: 'Товары от проверенных продавцов с удобной доставкой по Туркменистану.',
  },
  twitter: { card: 'summary' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="font-sans">
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
