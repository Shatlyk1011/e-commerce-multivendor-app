'use client'

import { useEffect, useState } from 'react'

import type { UserLocation } from './useUserLocation'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1'
const WALKING_SPEED_METRES_PER_SECOND = 1.25

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

const EMPTY_ROUTE_INFO: RouteInfo = { driving: null, walking: null, loading: false }

type RouteState = Omit<RouteInfo, 'loading'> & { routeKey: string | null }

async function fetchRoute(
  from: Pick<UserLocation, 'lat' | 'lng'>,
  to: { lat: number; lng: number },
): Promise<RouteResult | null> {
  const url =
    `${OSRM_BASE}/driving/` + `${from.lng},${from.lat};${to.lng},${to.lat}` + `?overview=full&geometries=geojson`

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

function estimateWalkingRoute(drivingRoute: RouteResult | null): RouteResult | null {
  if (!drivingRoute) return null

  return {
    ...drivingRoute,
    durationS: Math.round(drivingRoute.distanceM / WALKING_SPEED_METRES_PER_SECOND),
  }
}

export function useRouteInfo(
  userLocation: UserLocation | null,
  target: { lat: number; lng: number } | null,
): RouteInfo {
  const [info, setInfo] = useState<RouteState>({ routeKey: null, driving: null, walking: null })
  const userLat = userLocation?.lat
  const userLng = userLocation?.lng
  const targetLat = target?.lat
  const targetLng = target?.lng
  const routeKey =
    userLat === undefined || userLng === undefined || targetLat === undefined || targetLng === undefined
      ? null
      : `${userLat},${userLng}:${targetLat},${targetLng}`

  useEffect(() => {
    if (
      userLat === undefined ||
      userLng === undefined ||
      targetLat === undefined ||
      targetLng === undefined ||
      !routeKey
    ) {
      return
    }

    let cancelled = false

    fetchRoute({ lat: userLat, lng: userLng }, { lat: targetLat, lng: targetLng }).then((driving) => {
      if (!cancelled) {
        setInfo({ routeKey, driving, walking: estimateWalkingRoute(driving) })
      }
    })

    return () => {
      cancelled = true
    }
  }, [routeKey, targetLat, targetLng, userLat, userLng])

  if (!routeKey) return EMPTY_ROUTE_INFO

  const hasCurrentRoute = info.routeKey === routeKey
  return {
    driving: hasCurrentRoute ? info.driving : null,
    walking: hasCurrentRoute ? info.walking : null,
    loading: !hasCurrentRoute,
  }
}
