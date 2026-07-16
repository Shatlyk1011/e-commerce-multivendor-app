import * as React from 'react'

import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={`text-apple-caption-strong text-apple-ink block font-medium select-none ${className}`}
      {...props}
    />
  )
}

export { Label }
