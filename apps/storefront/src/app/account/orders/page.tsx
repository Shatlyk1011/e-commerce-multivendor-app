'use client'

import { useCustomerOrders } from '@/features/account/api/queries'
import { OrdersTab } from '@/features/account/components/OrdersTab'

export default function AccountOrdersPage() {
  const { data: orders = [] } = useCustomerOrders()

  return <OrdersTab orders={orders} />
}
