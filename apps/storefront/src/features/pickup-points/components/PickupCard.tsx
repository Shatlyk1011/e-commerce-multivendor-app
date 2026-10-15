import { Clock3, Phone } from 'lucide-react'

import { cn } from '@/lib/utils'

import { type PickupPoint } from '../data/pickup-points'

interface PickupCardProps {
  point: PickupPoint
  isSelected: boolean
  onClick: () => void
}

export function PickupCard({ point, isSelected, onClick }: PickupCardProps) {
  const phoneHref = `tel:${point.phone.replace(/\s/g, '')}`

  return (
    <div
      className={cn(
        'rounded-apple-md overflow-hidden border transition-all duration-150',
        isSelected
          ? 'border-apple-primary bg-apple-primary/5 ring-apple-primary/15 ring-1'
          : 'border-apple-hairline hover:border-apple-primary/50 bg-apple-canvas',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className="focus-visible:ring-apple-primary-focus w-full p-3 text-left transition-transform outline-none focus-visible:ring-2 focus-visible:ring-inset active:scale-[0.99]"
      >
        <div className="min-w-0">
          <h3 className="text-apple-ink text-[15px] leading-snug font-semibold tracking-tight">{point.name}</h3>
          <p className="text-apple-ink-muted-48 mt-1 text-[12px] leading-relaxed">{point.address}</p>
        </div>

        <div className="border-apple-divider-soft mt-3 border-t pt-2.5">
          <p className="text-apple-ink-muted-80 flex items-start gap-2 text-[12px] leading-relaxed">
            <Clock3 className="text-apple-ink-muted-48 mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{point.hours}</span>
          </p>
        </div>
      </button>

      <a
        href={phoneHref}
        className="border-apple-divider-soft text-apple-primary focus-visible:ring-apple-primary-focus flex min-h-11 items-center gap-2 border-t px-3 text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset"
        aria-label={`Позвонить в ${point.name}: ${point.phone}`}
      >
        <Phone className="size-3.5 shrink-0" aria-hidden="true" />
        <span>{point.phone}</span>
      </a>
    </div>
  )
}
