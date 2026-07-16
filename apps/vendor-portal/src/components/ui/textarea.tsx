import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'rounded-apple-sm border-apple-hairline bg-apple-canvas text-apple-ink placeholder:text-apple-ink-muted-48 focus-visible:border-apple-primary-focus focus-visible:ring-apple-primary-focus disabled:bg-apple-canvas-parchment h-24 w-full min-w-0 resize-y border px-3 py-2 text-[15px] transition-all outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
