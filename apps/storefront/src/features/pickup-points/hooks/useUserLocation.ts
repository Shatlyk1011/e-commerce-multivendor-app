'use client'

import { useCallback, useEffect, useState } from 'react'

const LOCATION_STORAGE_KEY = 'user_pickup_location'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export interface UserLocation {
  lat: number
  lng: number
  timestamp: number
}

export type LocationStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'unavailable'

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
        if (!stored) return

        const parsed: UserLocation = JSON.parse(stored)
        const isExpired = Date.now() - parsed.timestamp > ONE_WEEK_MS

        if (isExpired) {
          localStorage.removeItem(LOCATION_STORAGE_KEY)
          return
        }

        setUserLocation(parsed)
        setStatus('ready')
      } catch {
        // Location remains optional if storage is unavailable.
      }
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      return
    }

    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        }

        setUserLocation(location)
        setStatus('ready')

        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
        } catch {
          // The current session can still use the location.
        }
      },
      () => {
        setStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return { userLocation, requestLocation, status }
}
