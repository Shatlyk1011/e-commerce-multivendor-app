import type { Metadata } from 'next'
import Link from 'next/link'

import { MapPin, PackageCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { PickupPointsClient } from '@/features/pickup-points/components/PickupPointsClient'
import { TURKMENABAT_PICKUP_POINTS } from '@/features/pickup-points/data/pickup-points'

export const metadata: Metadata = {
  title: 'Пункты выдачи',
  description: 'Найдите ближайший пункт выдачи заказов в Туркменабате. Адреса, часы работы и контакты на карте.',
}

const pickupPointsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Пункты выдачи Bugday в Туркменабате',
  itemListElement: TURKMENABAT_PICKUP_POINTS.map((point, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Place',
      name: point.name,
      address: point.address,
      telephone: point.phone,
      openingHours: point.hours,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: point.lat,
        longitude: point.lng,
      },
    },
  })),
}

export default function PickupPointsPage() {
  return (
    <main className="bg-apple-canvas text-apple-ink min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pickupPointsSchema).replace(/</g, '\u003c') }}
      />

      <div className="custom-container mx-auto px-4 pt-5 sm:pt-7">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Пункты выдачи</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="custom-container mx-auto px-4 pt-10 pb-10 sm:pt-14 sm:pb-14" aria-labelledby="pickup-title">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge variant="outline" size="lg">
              Самовывоз в Туркменабате
            </Badge>
            <h1
              id="pickup-title"
              className="font-heading mt-6 max-w-3xl text-[42px] leading-[1.02] font-semibold tracking-[-1.2px] text-balance sm:text-[56px]"
            >
              Заберите заказ там, где удобно вам
            </h1>
            <p className="text-apple-ink-muted-80 mt-5 max-w-2xl text-[17px] leading-[1.55] tracking-[-0.374px]">
              Выберите пункт на карте, проверьте часы работы и постройте маршрут от вашего местоположения.
            </p>
          </div>

          <div className="border-apple-hairline rounded-apple-lg grid grid-cols-2 overflow-hidden border">
            <div className="border-apple-divider-soft flex min-h-28 flex-col justify-between border-r p-5">
              <MapPin className="text-apple-primary size-5" aria-hidden="true" />
              <p className="mt-6">
                <span className="font-heading block text-[24px] leading-none font-semibold">
                  {TURKMENABAT_PICKUP_POINTS.length}
                </span>
                <span className="text-apple-ink-muted-48 mt-1 block text-[12px]">пункта выдачи</span>
              </p>
            </div>
            <div className="flex min-h-28 flex-col justify-between p-5">
              <PackageCheck className="text-apple-primary size-5" aria-hidden="true" />
              <p className="mt-6">
                <span className="font-heading block text-[17px] leading-none font-semibold">Проверка на месте</span>
                <span className="text-apple-ink-muted-48 mt-1 block text-[12px]">до получения</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <PickupPointsClient />
    </main>
  )
}
