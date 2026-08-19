'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { AuthProvider } from '@/features/auth/components/AuthProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 * 5 } } }))
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-center" />
        <Header />
        {children}
        <Footer />
      </AuthProvider>
    </QueryClientProvider>
  )
}
