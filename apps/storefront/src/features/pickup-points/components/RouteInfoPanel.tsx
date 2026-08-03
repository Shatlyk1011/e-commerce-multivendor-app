import { Car, Footprints, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { RouteInfo } from '../hooks/useRouteInfo'

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} мин`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`
}

function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} м`
  return `${(metres / 1000).toFixed(1)} км`
}

interface RouteInfoPanelProps {
  routeInfo: RouteInfo
  className?: string
}

export function RouteInfoPanel({ routeInfo, className }: RouteInfoPanelProps) {
  const { driving, walking, loading } = routeInfo

  if (!driving && !walking && !loading) return null

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[14px] border border-[#e0e0e0] bg-white/95 px-4 py-3 backdrop-blur-sm',
        'shadow-[0_2px_16px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-[#7a7a7a]">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0066cc]" />
          Прокладываем маршрут…
        </div>
      ) : (
        <>
          {/* Distance pill */}
          {driving && (
            <span className="shrink-0 rounded-full bg-[#f0f0f5] px-2.5 py-0.5 text-[12px] font-semibold text-[#1d1d1f]">
              {formatDistance(driving.distanceM)}
            </span>
          )}

          {/* Divider */}
          {driving && walking && <span className="h-4 w-px shrink-0 bg-[#e0e0e0]" />}

          {/* Walk */}
          {walking && (
            <div className="flex items-center gap-1.5">
              <Footprints className="h-4 w-4 shrink-0 text-[#3c3c3e]" />
              <span className="text-[13px] font-medium text-[#1d1d1f]">{formatDuration(walking.durationS)}</span>
            </div>
          )}

          {/* Divider */}
          {driving && walking && <span className="h-4 w-px shrink-0 bg-[#e0e0e0]" />}

          {/* Car */}
          {driving && (
            <div className="flex items-center gap-1.5">
              <Car className="h-4 w-4 shrink-0 text-[#3c3c3e]" />
              <span className="text-[13px] font-medium text-[#1d1d1f]">{formatDuration(driving.durationS)}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
