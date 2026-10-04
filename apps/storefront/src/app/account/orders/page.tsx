'use client'

import { useCustomerOrders } from '@/features/account/api/queries'
import { AccountPageError, AccountPageSkeleton } from '@/features/account/components/AccountPageState'
import { OrdersTab } from '@/features/account/components/OrdersTab'

export default function AccountOrdersPage() {
  const { data: orders = [], isLoading, isError, refetch } = useCustomerOrders()

  if (isLoading) return <AccountPageSkeleton cards={2} />
  if (isError) return <AccountPageError onRetry={() => refetch()} />

  return <OrdersTab orders={orders} />
}
