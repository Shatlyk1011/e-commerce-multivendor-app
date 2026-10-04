'use client'

import { useCustomerAddresses } from '@/features/account/api/queries'
import { AccountPageError, AccountPageSkeleton } from '@/features/account/components/AccountPageState'
import { AddressesTab } from '@/features/account/components/AddressesTab'

export default function AccountAddressesPage() {
  const { data: addresses = [], isLoading, isError, refetch } = useCustomerAddresses()

  if (isLoading) return <AccountPageSkeleton cards={2} />
  if (isError) return <AccountPageError onRetry={() => refetch()} />

  return <AddressesTab addresses={addresses} />
}
