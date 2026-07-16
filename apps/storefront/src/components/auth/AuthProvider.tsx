'use client'

import { type ReactNode, createContext, useContext, useEffect } from 'react'

import type { HttpTypes } from '@medusajs/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { medusa } from '@/lib/medusa'

interface AuthContextValue {
  customer: HttpTypes.StoreCustomer | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const customerQuery = useQuery({
    queryKey: ['auth', 'customer'],
    queryFn: async () => (await medusa.store.customer.retrieve()).customer,
    retry: false,
  })

  useEffect(() => {
    if (customerQuery.error && 'status' in customerQuery.error && customerQuery.error.status === 401) {
      void fetch('/api/auth/logout', { method: 'POST' })
      queryClient.setQueryData(['auth', 'customer'], null)
    }
  }, [customerQuery.error, queryClient])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    queryClient.setQueryData(['auth', 'customer'], null)
  }

  return (
    <AuthContext.Provider
      value={{
        customer: customerQuery.data ?? null,
        isLoading: customerQuery.isLoading,
        isAuthenticated: Boolean(customerQuery.data),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
