'use client'

import { type ReactNode, createContext, useCallback, useContext } from 'react'

import type { AuthCustomer, AuthMeResponse } from '@dtc/api-contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getCurrentUser, logoutCustomer, sendOtp, verifyOtp } from '../api/client'

const authQueryKey = ['auth', 'me'] as const

type AuthContextValue = {
  customer: AuthCustomer | null
  isAuthenticated: boolean
  isLoading: boolean
  requestOtp: (phone: string) => Promise<void>
  login: (phone: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthCustomer | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const currentUserQuery = useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
  })

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => sendOtp({ phone }),
  })

  const loginMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => verifyOtp({ phone, otp }),
  })

  const logoutMutation = useMutation({
    mutationFn: logoutCustomer,
    onSuccess: () => {
      queryClient.setQueryData<AuthMeResponse>(authQueryKey, {
        authenticated: false,
        customer: null,
      })
    },
  })

  const refreshUser = useCallback(async () => {
    const result = await currentUserQuery.refetch()

    if (result.error) {
      throw result.error
    }

    return result.data?.customer ?? null
  }, [currentUserQuery])

  const requestOtp = useCallback(
    async (phone: string) => {
      await sendOtpMutation.mutateAsync(phone)
    },
    [sendOtpMutation],
  )

  const login = useCallback(
    async (phone: string, otp: string) => {
      await loginMutation.mutateAsync({ phone, otp })
      const customer = await refreshUser()

      if (!customer) {
        throw new Error('The authentication session was not created.')
      }
    },
    [loginMutation, refreshUser],
  )

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const customer = currentUserQuery.data?.customer ?? null

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: Boolean(customer),
        isLoading: currentUserQuery.isLoading,
        requestOtp,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
