import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden font-sans font-medium whitespace-nowrap transition-all select-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-apple-primary text-apple-on-primary rounded-apple-pill',
        secondary:
          'border-apple-hairline bg-apple-canvas-parchment text-apple-ink hover:bg-apple-divider-soft rounded-apple-pill',
        outline: 'border-apple-hairline bg-apple-canvas text-apple-ink rounded-apple-pill',
        ghost: 'border-transparent text-apple-ink-muted-80 hover:bg-apple-canvas-parchment rounded-apple-pill',
        pearl: 'border border-apple-divider-soft bg-apple-surface-pearl text-apple-ink-muted-80 rounded-apple-md',
        dark: 'border-transparent bg-apple-ink text-apple-on-dark rounded-apple-pill',
        destructive: 'border-destructive/20 bg-destructive/10 text-destructive rounded-apple-pill',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 rounded-apple-pill',
        link: 'border-transparent text-apple-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-6 px-2.5 py-0.5 text-[12px] tracking-tight',
        sm: 'h-5 px-2 py-0.5 text-[11px] tracking-tight',
        lg: 'h-7 px-3 py-1 text-[13px] tracking-tight',
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
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
