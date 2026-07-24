import * as React from 'react'

import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Layout & shape — matches {rounded.sm} = 8px, height 44px touch target
        'flex h-11 w-full min-w-0',
        // Border — {colors.hairline} #e0e0e0
        'border-apple-hairline border',
        // Background — {colors.canvas-parchment} #f5f5f7
        'bg-apple-canvas-parchment',
        // Padding & typography — {typography.caption} 14px / -0.224px tracking
        'text-apple-ink px-3.5 py-2.5 font-sans text-[14px] tracking-[-0.224px]',
        // Placeholder — {colors.ink-muted-48} at reduced opacity
        'placeholder:text-apple-ink/30',
        // Transitions
        'transition-all outline-none',
        // Focus — {colors.primary} #0066cc ring (2px solid, 20% alpha glow)
        'focus-visible:border-apple-primary focus-visible:ring-apple-primary/20 focus-visible:ring-2',
        // Disabled
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        // Error state — aria-invalid
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-2',
        // File input resets
        'file:text-apple-ink file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
