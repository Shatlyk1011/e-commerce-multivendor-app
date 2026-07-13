import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center font-sans font-bold leading-none uppercase select-none transition-colors border',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-apple-primary text-apple-on-primary',
        secondary: 'border-apple-hairline bg-apple-canvas-parchment text-apple-ink-muted-80',
        outline: 'border-apple-hairline bg-apple-canvas text-apple-ink',
        destructive: 'border-transparent bg-rose-500 text-white',
        sale: 'border-rose-200/50 bg-rose-50 text-rose-700',
        primaryLight: 'border-apple-primary/20 bg-apple-primary/10 text-apple-primary',
      },
      size: {
        default: 'rounded-apple-sm px-2 py-0.5 text-[11px]',
        pill: 'rounded-apple-pill px-2.5 py-0.5 text-[12px] tracking-wider',
        xs: 'rounded-apple-xs px-1.5 py-0.5 text-[9px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
