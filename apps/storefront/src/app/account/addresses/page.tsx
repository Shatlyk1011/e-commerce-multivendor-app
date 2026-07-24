'use client'

import { useCustomerAddresses } from '@/features/account/api/queries'
import { AddressesTab } from '@/features/account/components/AddressesTab'

export default function AccountAddressesPage() {
  const { data: addresses = [] } = useCustomerAddresses()

  return <AddressesTab addresses={addresses} />
}
