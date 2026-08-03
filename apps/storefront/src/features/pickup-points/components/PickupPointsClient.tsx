'use client'

import { useState } from 'react'

import dynamic from 'next/dynamic'

import 'leaflet/dist/leaflet.css'

import { cn } from '@/lib/utils'

import { CITY_CENTER, type PickupPoint, TURKMENABAT_PICKUP_POINTS } from '../data/pickup-points'
import { useRouteInfo } from '../hooks/useRouteInfo'
import { useUserLocation } from '../hooks/useUserLocation'
import { MapPinIcon } from './MapPinIcon'
import { PickupCard } from './PickupCard'
import { RouteInfoPanel } from './RouteInfoPanel'
import { WorkingHoursSection } from './WorkingHoursSection'

// Dynamically import the map with SSR disabled (Leaflet requires window)
const PickupMap = dynamic(() => import('./PickupMap').then((m) => ({ default: m.PickupMap })), { ssr: false })

// ─── Main component ───────────────────────────────────────────────────────────

export function PickupPointsClient() {
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(null)
  const userLocation = useUserLocation()

  // Route to the selected card, or fall back to the first pickup point
  const targetPoint = selectedPoint ?? TURKMENABAT_PICKUP_POINTS[0] ?? null
  const routeInfo = useRouteInfo(userLocation, targetPoint)

  const handleSelect = (point: PickupPoint) => {
    setSelectedPoint((prev) => (prev?.id === point.id ? null : point))
  }

  return (
    <main className="min-h-[calc(100vh-44px)] bg-[#f5f5f7]">
      {/* ── Map + Cards ─────────────────────────────── */}
      <section className="custom-container px-6 py-8">
        <div className="flex gap-6 max-lg:flex-col">
          {/* ── Cards sidebar ── */}
          <aside className="flex w-[340px] shrink-0 flex-col gap-2 max-lg:w-full max-lg:flex-row max-lg:overflow-x-auto max-lg:pb-2 max-md:flex-col">
            <div className="flex items-center gap-2 max-lg:hidden">
              <MapPinIcon className="text-apple-ink-muted-48 h-4 w-4" />
              <span className="text-apple-body-strong text-apple-ink">Туркменабат</span>
              <span className="text-apple-caption text-apple-ink-muted-48 ml-auto">
                {TURKMENABAT_PICKUP_POINTS.length} локации
              </span>
            </div>

            {TURKMENABAT_PICKUP_POINTS.map((point) => (
              <div key={point.id} className={cn('max-lg:min-w-[300px]')}>
                <PickupCard
                  point={point}
                  isSelected={selectedPoint?.id === point.id}
                  onClick={() => handleSelect(point)}
                />
              </div>
            ))}
          </aside>

          {/* ── Map ── */}
          <div className="flex-1 overflow-hidden rounded-[18px] border border-[#e0e0e0] bg-white">
            <div className="relative h-[560px] w-full scale-105">
              <PickupMap
                points={TURKMENABAT_PICKUP_POINTS}
                selectedPoint={selectedPoint}
                onSelectPoint={handleSelect}
                center={CITY_CENTER}
                userLocation={userLocation}
                drivingRoute={routeInfo.driving}
              />

              {/* Map overlay: city label */}
              <div className="pointer-events-none absolute top-4 left-4 z-[400] flex items-center gap-2 rounded-[11px] bg-white/90 px-3 py-2 backdrop-blur-sm">
                <span className="text-apple-fine-print text-apple-ink font-semibold">Туркменабат,</span>
                <span className="text-apple-fine-print text-apple-ink-muted-48">Лебап</span>
              </div>

              {/* Route info panel — visible only when user location is known */}
              {userLocation && (
                <div className="absolute bottom-5 left-1/2 z-[400] -translate-x-1/2">
                  <RouteInfoPanel routeInfo={routeInfo} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Working hours + How it works ────────────── */}
      <WorkingHoursSection />
    </main>
  )
}
