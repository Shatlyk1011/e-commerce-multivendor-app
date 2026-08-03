import type { Metadata } from 'next'

import { PickupPointsClient } from '@/features/pickup-points/components/PickupPointsClient'

export const metadata: Metadata = {
  title: 'Пункты выдачи',
  description: 'Найдите ближайший пункт выдачи заказов в Туркменабате. Адреса, часы работы и контакты на карте.',
}

export default function PickupPointsPage() {
  return <PickupPointsClient />
}
