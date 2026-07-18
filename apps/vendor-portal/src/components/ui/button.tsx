import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus active:scale-95 duration-150 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-apple-primary text-apple-on-primary hover:bg-apple-primary-focus rounded-apple-pill border-none',
        outline:
          'border border-apple-hairline bg-apple-canvas text-apple-ink hover:bg-apple-canvas-parchment rounded-apple-pill',
        secondary:
          'bg-apple-canvas-parchment text-apple-primary border border-apple-primary/10 hover:bg-apple-surface-pearl rounded-apple-sm',
        secondaryPill:
          'bg-transparent text-apple-primary border border-apple-primary hover:bg-apple-primary/10 rounded-apple-pill',
        ghost:
          'text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink rounded-apple-sm border-none',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 rounded-apple-pill border-none',
        link: 'text-apple-primary underline-offset-4 hover:underline bg-transparent border-none',
        dark: 'bg-apple-ink text-apple-on-dark hover:bg-apple-ink/90 rounded-apple-sm border-none',
        pearl:
          'bg-apple-surface-pearl text-apple-ink-muted-80 border-3 border-apple-divider-soft rounded-apple-md hover:bg-apple-canvas-parchment',
        iconCircular:
          'bg-apple-surface-chip-translucent text-apple-ink hover:bg-apple-surface-chip-translucent/80 rounded-apple-full border-none',
      },
      size: {
        default: 'h-11 gap-2 px-[22px] text-[17px]',
        xs: 'h-7 gap-1 px-2.5 text-[12px]',
        sm: 'h-9 gap-1.5 px-[15px] text-[14px]',
        md: 'h-11 gap-2 px-[18px] text-[15px]',
        lg: 'h-12 gap-2 px-7 text-[18px]',
        icon: 'size-11 p-0 rounded-apple-full',
        'icon-xs': 'size-6 p-0 rounded-apple-sm',
        'icon-sm': 'size-7 p-0 rounded-apple-sm',
        'icon-lg': 'size-9 p-0 rounded-apple-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'sm',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
