import * as React from 'react'

import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}

export function Spinner({ size = 'md', fullPage = false, className, ...props }: SpinnerProps) {
  const spinnerElement = (
    <div
      className={cn(
        'border-apple-primary animate-spin rounded-full border-t-transparent',
        {
          'h-4 w-4 border-2': size === 'sm',
          'h-6 w-6 border-2': size === 'md',
          'h-10 w-10 border-3': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
        {spinnerElement}
      </div>
    )
  }

  return spinnerElement
}
