'use client'

import { useEffect, useState } from 'react'

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import type { PickupPoint } from '../data/pickup-points'

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
}

function createCustomIcon(isSelected: boolean) {
  // All dots: same shape (filled blue circle), active = white ring border
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

export function PickupMap({ points, selectedPoint, onSelectPoint, center }: PickupMapProps) {
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

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full" zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FlyToMarker point={selectedPoint} />
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
