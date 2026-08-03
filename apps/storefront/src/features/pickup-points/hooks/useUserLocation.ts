'use client'

import { useEffect, useState } from 'react'

const LOCATION_STORAGE_KEY = 'user_pickup_location'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export interface UserLocation {
  lat: number
  lng: number
  timestamp: number
}

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)

  useEffect(() => {
    // 1. Check local storage first
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
      if (stored) {
        const parsed: UserLocation = JSON.parse(stored)
        const isExpired = Date.now() - parsed.timestamp > ONE_WEEK_MS
        if (!isExpired) {
          setUserLocation(parsed)
          return
        } else {
          localStorage.removeItem(LOCATION_STORAGE_KEY)
        }
      }
    } catch {
      // ignore storage errors
    }

    // 2. Ask for browser location permission
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
          }
          setUserLocation(loc)
          try {
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc))
          } catch {
            // ignore storage errors
          }
        },
        () => {
          // User declined or error occurred — do nothing
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    }
  }, [])

  return userLocation
}
