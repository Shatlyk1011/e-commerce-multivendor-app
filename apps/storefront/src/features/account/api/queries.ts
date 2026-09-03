import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { CreateAddressInput, UpdateAddressInput, UpdateCustomerInput } from './client'
import {
  createCustomerAddress,
  createCustomerFavorite,
  deleteCustomerAddress,
  deleteCustomerFavorite,
  getCustomerAddresses,
  getCustomerFavorites,
  getCustomerOrder,
  getCustomerOrders,
  getCustomerProfile,
  updateCustomerAddress,
  updateCustomerProfile,
} from './client'

export const accountKeys = {
  all: ['account'] as const,
  profile: () => [...accountKeys.all, 'profile'] as const,
  addresses: () => [...accountKeys.all, 'addresses'] as const,
  favorites: () => [...accountKeys.all, 'favorites'] as const,
  orders: () => [...accountKeys.all, 'orders'] as const,
  orderDetail: (id: string) => [...accountKeys.orders(), id] as const,
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: accountKeys.profile(),
    queryFn: getCustomerProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCustomerInput) => updateCustomerProfile(data),
    onSuccess: (updatedCustomer) => {
      queryClient.setQueryData(accountKeys.profile(), updatedCustomer)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Профиль успешно обновлен')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Не удалось обновить профиль')
    },
  })
}

export function useCustomerAddresses() {
  return useQuery({
    queryKey: accountKeys.addresses(),
    queryFn: getCustomerAddresses,
  })
}

export function useCustomerFavorites(enabled = true) {
  return useQuery({
    queryKey: accountKeys.favorites(),
    queryFn: getCustomerFavorites,
    enabled,
    refetchOnMount: 'always',
  })
}

export function useDeleteCustomerFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomerFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.favorites() })
      toast.success('Товар удален из избранного')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Не удалось удалить товар из избранного')
    },
  })
}

export function useCreateCustomerFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomerFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.favorites() })
      toast.success('Товар добавлен в избранное')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Не удалось добавить товар в избранное')
    },
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAddressInput) => createCustomerAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.addresses() })
      toast.success('Адрес успешно добавлен')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Не удалось добавить адрес')
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: UpdateAddressInput }) =>
      updateCustomerAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.addresses() })
      toast.success('Адрес сохранен')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Не удалось сохранить адрес')
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) => deleteCustomerAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.addresses() })
      toast.success('Адрес удален')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Не удалось удалить адрес')
    },
  })
}

export function useCustomerOrders() {
  return useQuery({
    queryKey: accountKeys.orders(),
    queryFn: getCustomerOrders,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchInterval: 30 * 1000,
  })
}

export function useCustomerOrder(orderId: string) {
  return useQuery({
    queryKey: accountKeys.orderDetail(orderId),
    queryFn: () => getCustomerOrder(orderId),
    enabled: Boolean(orderId),
  })
}
