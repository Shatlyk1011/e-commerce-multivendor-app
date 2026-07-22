'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { AuthProvider } from '@/features/auth/components/AuthProvider'

import '../../public/fonts.css'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000 * 5, // 5 minutes
          },
        },
      }),
  )

  return (
    <html lang="en" className="font-sans">
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Toaster position="top-center" />
            <Header />
            {children}
            <Footer />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
