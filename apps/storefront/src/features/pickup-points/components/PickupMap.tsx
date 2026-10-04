'use client'

import { useEffect, useState } from 'react'

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

import type { PickupPoint } from '../data/pickup-points'
import type { RouteResult } from '../hooks/useRouteInfo'
import type { UserLocation } from '../hooks/useUserLocation'

interface FlyToMarkerProps {
  point: PickupPoint | null
}

function FlyToMarker({ point }: FlyToMarkerProps) {
  const map = useMap()

  useEffect(() => {
    if (point) {
      map.flyTo([point.lat, point.lng], 15, { duration: 1.2 })
    }
  }, [point, map])

  return null
}

interface PickupMapProps {
  points: PickupPoint[]
  selectedPoint: PickupPoint | null
  onSelectPoint: (point: PickupPoint) => void
  center: [number, number]
  userLocation?: UserLocation | null
  /** Real road geometry from OSRM — preferred over straight line */
  drivingRoute?: RouteResult | null
}

function createCustomIcon(isSelected: boolean) {
  const FILL = '#0066cc'
  const SIZE = 32
  const svg = isSelected
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="15" fill="#ccc"/>
        <circle cx="16" cy="16" r="10" fill="${FILL}"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="10" fill="${FILL}"/>
       </svg>`

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [SIZE, SIZE],
    iconAnchor: [SIZE / 2, SIZE / 2],
    popupAnchor: [0, -(SIZE / 2 + 4)],
  })
}

function createUserIcon() {
  const SIZE = 24
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#2997ff" fill-opacity="0.25"/>
    <circle cx="12" cy="12" r="6" fill="#0066cc" stroke="#ffffff" stroke-width="2"/>
  </svg>`

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [SIZE, SIZE],
    iconAnchor: [SIZE / 2, SIZE / 2],
    popupAnchor: [0, -(SIZE / 2 + 4)],
  })
}

export function PickupMap({
  points,
  selectedPoint,
  onSelectPoint,
  center,
  userLocation,
  drivingRoute,
}: PickupMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f5f5f7]">
        <div className="text-apple-caption text-[#7a7a7a]">Loading map…</div>
      </div>
    )
  }

  const targetPoint = selectedPoint || points[0]

  // Use real road geometry when available, fall back to straight line
  const routeCoords: [number, number][] | null =
    drivingRoute?.geometry ??
    (userLocation && targetPoint
      ? [
          [userLocation.lat, userLocation.lng],
          [targetPoint.lat, targetPoint.lng],
        ]
      : null)

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToMarker point={selectedPoint} />

      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
          <Popup className="pickup-popup" offset={[0, -8]}>
            <div className="min-w-[120px]">
              <p className="text-[13px] leading-snug font-semibold text-[#1d1d1f]">Ваше местоположение</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Road route polyline */}
      {routeCoords && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: '#0066cc',
            weight: 4,
            opacity: 0.75,
            // Solid when real route is loaded, dashed while falling back to straight line
            dashArray: drivingRoute ? undefined : '8, 8',
          }}
        />
      )}

      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={createCustomIcon(selectedPoint?.id === point.id)}
          eventHandlers={{ click: () => onSelectPoint(point) }}
        >
          <Popup className="pickup-popup" offset={[0, -8]}>
            <div className="min-w-[160px]">
              <p className="text-[13px] leading-snug font-semibold text-[#1d1d1f]">{point.name}</p>
              <p className="mt-1 text-[12px] leading-snug text-[#7a7a7a]">{point.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
