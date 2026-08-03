import { cn } from '@/lib/utils'

import { type PickupPoint } from '../data/pickup-points'

interface PickupCardProps {
  point: PickupPoint
  isSelected: boolean
  onClick: () => void
}

export function PickupCard({ point, isSelected, onClick }: PickupCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-[14px] border px-4 py-3.5 text-left transition-all duration-200',
        'hover:border-[#c0c0c0] active:scale-[0.99]',
        isSelected ? 'border-[#0066cc] bg-white' : 'border-[#e0e0e0] bg-white',
      )}
    >
      {/* Name */}
      <h3 className="text-apple-body-strong text-apple-ink leading-snug">{point.name}</h3>

      {/* Address */}
      <p className="text-apple-caption text-apple-ink-muted-48 mt-1">{point.address}</p>

      {/* Phone only */}
      <span className="text-apple-fine-print mt-2 inline-block text-[#0066cc]">{point.phone}</span>
    </button>
  )
}
