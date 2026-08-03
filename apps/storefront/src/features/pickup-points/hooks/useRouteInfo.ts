'use client'

import { useEffect, useState } from 'react'

import type { UserLocation } from './useUserLocation'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1'

export interface RouteResult {
  /** Coordinates as [lat, lng] pairs ready for Leaflet Polyline */
  geometry: [number, number][]
  /** Distance in metres */
  distanceM: number
  /** Duration in seconds */
  durationS: number
}

export interface RouteInfo {
  driving: RouteResult | null
  walking: RouteResult | null
  loading: boolean
}

async function fetchRoute(
  mode: 'driving' | 'walking',
  from: UserLocation,
  to: { lat: number; lng: number },
): Promise<RouteResult | null> {
  const url =
    `${OSRM_BASE}/${mode}/` + `${from.lng},${from.lat};${to.lng},${to.lat}` + `?overview=full&geometries=geojson`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()
    const route = data.routes?.[0]
    if (!route) return null

    // OSRM returns [lng, lat] — flip to [lat, lng] for Leaflet
    const geometry: [number, number][] = route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])

    return {
      geometry,
      distanceM: route.distance,
      durationS: route.duration,
    }
  } catch {
    return null
  }
}

export function useRouteInfo(
  userLocation: UserLocation | null,
  target: { lat: number; lng: number } | null,
): RouteInfo {
  const [info, setInfo] = useState<RouteInfo>({ driving: null, walking: null, loading: false })

  useEffect(() => {
    if (!userLocation || !target) {
      setInfo({ driving: null, walking: null, loading: false })
      return
    }

    let cancelled = false
    setInfo((prev) => ({ ...prev, loading: true }))

    Promise.all([fetchRoute('driving', userLocation, target), fetchRoute('walking', userLocation, target)]).then(
      ([driving, walking]) => {
        if (!cancelled) {
          setInfo({ driving, walking, loading: false })
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [userLocation, target?.lat, target?.lng])

  return info
}
