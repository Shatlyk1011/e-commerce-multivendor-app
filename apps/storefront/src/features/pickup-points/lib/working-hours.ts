'use client'

import { useEffect, useState } from 'react'

import { WORKING_HOURS } from '../data/working-hours'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parses a time string like "10:00" → total minutes from midnight.
 */
export function parseMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

/**
 * Returns a human-readable status string (in Russian) for the current time
 * relative to today's working hours entry in WORKING_HOURS.
 */
export function getTodayStatus(now: Date): {
  statusText: string
  isOpen: boolean
  todayIndex: number
} {
  // JS: 0=Sun,1=Mon,...,6=Sat → map to WORKING_HOURS index (Mon=0)
  const jsDay = now.getDay()
  const index = jsDay === 0 ? 6 : jsDay - 1 // 0=Mon … 6=Sun
  const entry = WORKING_HOURS[index]

  if (!entry || !entry.open) {
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (index + i) % 7
      const next = WORKING_HOURS[nextIndex]
      if (next?.open) {
        return {
          statusText: `Выходной · Откроется в ${next.hours.split('–')[0].trim()} (${next.day.toLowerCase()})`,
          isOpen: false,
          todayIndex: index,
        }
      }
    }
    return { statusText: 'Выходной', isOpen: false, todayIndex: index }
  }

  // Parse open/close from e.g. "10:00 – 18:00"
  const parts = entry.hours.split('–').map((s) => s.trim())
  if (parts.length < 2) return { statusText: '', isOpen: false, todayIndex: index }

  const openMin = parseMinutes(parts[0])
  const closeMin = parseMinutes(parts[1])
  const nowMin = now.getHours() * 60 + now.getMinutes()

  if (nowMin < openMin) {
    const diff = openMin - nowMin
    const h = Math.floor(diff / 60)
    const m = diff % 60
    const until = h > 0 ? (m > 0 ? `${h} ч ${m} мин` : `${h} ч`) : `${m} мин`
    return { statusText: `Закрыто · Откроется через ${until}`, isOpen: false, todayIndex: index }
  }

  if (nowMin >= closeMin) {
    for (let i = 1; i <= 7; i++) {
      const nextIndex = (index + i) % 7
      const next = WORKING_HOURS[nextIndex]
      if (next?.open) {
        return {
          statusText: `Закрыто · Откроется в ${next.hours.split('–')[0].trim()} (${next.day.toLowerCase()})`,
          isOpen: false,
          todayIndex: index,
        }
      }
    }
    return { statusText: 'Закрыто', isOpen: false, todayIndex: index }
  }

  // Currently open
  const diff = closeMin - nowMin
  const h = Math.floor(diff / 60)
  const m = diff % 60
  const until = h > 0 ? (m > 0 ? `${h} ч ${m} мин` : `${h} ч`) : `${m} мин`
  return { statusText: `Открыто · Закроется через ${until}`, isOpen: true, todayIndex: index }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Returns current Date, re-renders every 30 seconds. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}
