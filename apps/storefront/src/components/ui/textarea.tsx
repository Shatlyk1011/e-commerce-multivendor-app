import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Layout & shape — matches {rounded.sm} = 8px
        'rounded-apple-sm flex min-h-20 w-full min-w-0',
        // Border — {colors.hairline} #e0e0e0
        'border-apple-hairline border',
        // Background — transparent by default
        'bg-transparent',
        // Padding & typography — {typography.caption} 14px / -0.224px tracking
        'text-apple-ink px-3.5 py-2.5 font-sans text-[14px] tracking-[-0.224px]',
        // Placeholder — {colors.ink-muted-48} at reduced opacity
        'placeholder:text-apple-ink/50',
        // Transitions
        'transition-all outline-none',
        // Focus — {colors.primary} #0066cc ring (2px solid, 20% alpha glow)
        'focus-visible:border-apple-primary focus-visible:ring-apple-primary/20 focus-visible:ring-2',
        // Disabled
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        // Error state — aria-invalid
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
