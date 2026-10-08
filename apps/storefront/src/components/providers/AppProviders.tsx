'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import type { Locale } from '@/lib/i18n'

import { I18nProvider } from './I18nProvider'

export function AppProviders({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 * 5 } } }))
  return (
    <I18nProvider initialLocale={locale}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-center" />
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}
