'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

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
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <html lang="en" className="font-sans">
      <body className="text-apple-body antialiased">
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-center" />
          <Header />
          {children}
          <Footer />
        </QueryClientProvider>
      </body>
    </html>
  )
}
