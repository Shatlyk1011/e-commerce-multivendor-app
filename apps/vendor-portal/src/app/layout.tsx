'use client'

import { useState } from 'react'

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { medusa } from '@/lib/medusa'

import '../../public/fonts.css'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => {
    const handleAuthError = async (error: any) => {
      const status = error.status || error.response?.status
      if (status === 401 && window.location.pathname !== '/login') {
        console.warn('Unauthorized request (401), redirecting to login...')

        try {
          await medusa.auth.logout()
        } catch (logoutError) {
          console.error('Failed to logout via SDK during 401:', logoutError)
        }

        // Clear all client-accessible cookies
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
        })

        // Redirect to login page
        window.location.href = '/login'
      }
    }

    return new QueryClient({
      queryCache: new QueryCache({
        onError: handleAuthError,
      }),
      mutationCache: new MutationCache({
        onError: handleAuthError,
      }),
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000 * 5, // 5 minutes
          retry: (failureCount, error: any) => {
            // Do not retry on 401 errors
            const status = error?.status || error?.response?.status
            if (status === 401) return false
            return failureCount < 3
          },
        },
      },
    })
  })

  return (
    <html lang="ru" className="font-sans" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vendor-portal-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.classList.toggle('dark',d)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
