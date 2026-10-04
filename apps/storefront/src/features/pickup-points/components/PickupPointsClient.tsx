'use client'

import { useState } from 'react'

import dynamic from 'next/dynamic'

import 'leaflet/dist/leaflet.css'
import { Loader2, LocateFixed, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { CITY_CENTER, type PickupPoint, TURKMENABAT_PICKUP_POINTS } from '../data/pickup-points'
import { useRouteInfo } from '../hooks/useRouteInfo'
import { useUserLocation } from '../hooks/useUserLocation'
import { PickupCard } from './PickupCard'
import { RouteInfoPanel } from './RouteInfoPanel'
import { WorkingHoursSection } from './WorkingHoursSection'

const PickupMap = dynamic(() => import('./PickupMap').then((module) => ({ default: module.PickupMap })), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
})

const locationMessages = {
  denied: 'Не удалось определить местоположение. Проверьте разрешение браузера.',
  unavailable: 'Определение местоположения недоступно на этом устройстве.',
} as const

export function PickupPointsClient() {
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(TURKMENABAT_PICKUP_POINTS[0] ?? null)
  const { userLocation, requestLocation, status } = useUserLocation()
  const routeInfo = useRouteInfo(userLocation, selectedPoint)

  const handleSelect = (point: PickupPoint) => {
    setSelectedPoint(point)
  }

  return (
    <>
      <section className="custom-container mx-auto px-4 pb-16 sm:pb-20" aria-labelledby="locations-title">
        <div className="border-apple-hairline rounded-apple-lg overflow-hidden border">
          <div className="border-apple-divider-soft bg-apple-canvas flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="text-apple-primary size-4" aria-hidden="true" />
                <h2 id="locations-title" className="font-heading text-[17px] font-semibold tracking-tight">
                  Туркменабат
                </h2>
              </div>
              <p className="text-apple-ink-muted-48 mt-1 text-[12px]">
                {TURKMENABAT_PICKUP_POINTS.length} пункта на карте
              </p>
            </div>

            <Button
              type="button"
              variant={status === 'ready' ? 'secondary' : 'outline'}
              size="sm"
              className="min-h-11 w-full sm:w-auto"
              onClick={requestLocation}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LocateFixed className="size-4" aria-hidden="true" />
              )}
              {status === 'loading'
                ? 'Определяем…'
                : status === 'ready'
                  ? 'Местоположение найдено'
                  : 'Найти ближайший пункт'}
            </Button>
          </div>

          {status in locationMessages && (
            <p
              role="status"
              className="border-apple-divider-soft bg-apple-canvas-parchment text-apple-ink-muted-80 border-b px-5 py-3 text-[12px]"
            >
              {locationMessages[status as keyof typeof locationMessages]}
            </p>
          )}

          <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="bg-apple-canvas lg:border-apple-divider-soft order-2 min-w-0 p-3 lg:order-1 lg:border-r lg:p-4">
              <div className="flex snap-x gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {TURKMENABAT_PICKUP_POINTS.map((point) => (
                  <div key={point.id} className="w-[300px] shrink-0 snap-start sm:w-[340px] lg:w-full">
                    <PickupCard
                      point={point}
                      isSelected={selectedPoint?.id === point.id}
                      onClick={() => handleSelect(point)}
                    />
                  </div>
                ))}
              </div>
            </aside>

            <div className="bg-apple-canvas-parchment relative order-1 h-[420px] min-w-0 sm:h-[500px] lg:order-2 lg:h-[640px]">
              <PickupMap
                points={TURKMENABAT_PICKUP_POINTS}
                selectedPoint={selectedPoint}
                onSelectPoint={handleSelect}
                center={CITY_CENTER}
                userLocation={userLocation}
                drivingRoute={routeInfo.driving}
              />

              <div className="rounded-apple-md border-apple-hairline bg-apple-canvas/90 pointer-events-none absolute top-4 left-4 z-[400] border px-3 py-2 backdrop-blur-md">
                <p className="text-apple-ink text-[12px] font-semibold">Туркменабат</p>
                <p className="text-apple-ink-muted-48 mt-0.5 text-[11px]">Лебапский велаят</p>
              </div>

              {userLocation && (
                <div className="absolute right-3 bottom-3 left-3 z-[400] flex justify-center sm:right-auto sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2">
                  <RouteInfoPanel routeInfo={routeInfo} className="max-w-full" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <WorkingHoursSection />
    </>
  )
}
