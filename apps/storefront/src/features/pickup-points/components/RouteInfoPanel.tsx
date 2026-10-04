import { Car, Footprints, Loader2, Route } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { RouteInfo } from '../hooks/useRouteInfo'

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours} ч ${remainingMinutes} мин` : `${hours} ч`
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
        'border-apple-hairline bg-apple-canvas/95 rounded-apple-md flex min-h-12 items-center gap-3 border px-4 py-3 backdrop-blur-md',
        className,
      )}
    >
      {loading ? (
        <div className="text-apple-ink-muted-48 flex items-center gap-2 text-[13px]">
          <Loader2 className="text-apple-primary size-3.5 animate-spin" aria-hidden="true" />
          Прокладываем маршрут…
        </div>
      ) : (
        <>
          {driving && (
            <span className="bg-apple-canvas-parchment text-apple-ink rounded-apple-pill flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold">
              <Route className="text-apple-primary size-3.5" aria-hidden="true" />
              {formatDistance(driving.distanceM)}
            </span>
          )}
          {walking && (
            <div className="text-apple-ink flex items-center gap-1.5 text-[13px] font-semibold">
              <Footprints className="text-apple-ink-muted-48 size-4 shrink-0" aria-hidden="true" />
              <span>{formatDuration(walking.durationS)}</span>
            </div>
          )}
          {driving && (
            <div className="border-apple-divider-soft text-apple-ink flex items-center gap-1.5 border-l pl-3 text-[13px] font-semibold">
              <Car className="text-apple-ink-muted-48 size-4 shrink-0" aria-hidden="true" />
              <span>{formatDuration(driving.durationS)}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
