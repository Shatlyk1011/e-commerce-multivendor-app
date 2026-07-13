import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'rounded-apple-sm border-apple-hairline bg-apple-canvas font-text text-apple-ink placeholder:text-apple-ink-muted-48 focus-visible:border-apple-primary-focus focus-visible:ring-apple-primary-focus disabled:bg-apple-canvas-parchment aria-invalid:border-destructive aria-invalid:ring-destructive/20 h-10 w-full min-w-0 border px-3 py-1.5 text-[15px] transition-all outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
