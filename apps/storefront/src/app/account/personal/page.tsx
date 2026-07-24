'use client'

import { useCustomerProfile } from '@/features/account/api/queries'
import { PersonalInfoTab } from '@/features/account/components/PersonalInfoTab'
import { useAuth } from '@/features/auth/components/AuthProvider'

export default function AccountPersonalPage() {
  const { customer } = useAuth()
  const { data: storeCustomer } = useCustomerProfile()

  const displayCustomer = {
    first_name: storeCustomer?.first_name || customer?.first_name,
    last_name: storeCustomer?.last_name || customer?.last_name,
    company_name: storeCustomer?.company_name,
    phone_number: customer?.phone_number,
    phone: storeCustomer?.phone || customer?.phone_number,
    email: storeCustomer?.email || customer?.email,
  }

  return <PersonalInfoTab customer={displayCustomer} />
}
