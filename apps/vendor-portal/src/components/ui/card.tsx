import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  size?: 'default' | 'sm'
  variant?: 'default' | 'parchment' | 'dark' | 'ghost'
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        'group/card rounded-apple-lg flex flex-col gap-(--card-spacing) overflow-hidden transition-all duration-200 [--card-spacing:--spacing(6)] data-[size=sm]:[--card-spacing:--spacing(4)]',
        variant === 'default' && 'border-apple-hairline bg-apple-canvas text-apple-ink border shadow-none',
        variant === 'parchment' && 'border-apple-hairline bg-apple-canvas-parchment text-apple-ink border shadow-none',
        variant === 'dark' &&
          'border-apple-surface-tile-2 bg-apple-surface-tile-1 text-apple-on-dark border shadow-none',
        variant === 'ghost' && 'text-apple-ink border-none bg-transparent shadow-none',
        '*:[img:first-child]:rounded-t-apple-lg *:[img:last-child]:rounded-b-apple-lg has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 px-(--card-spacing) pt-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'text-apple-ink group-data-[variant=dark]/card:text-apple-on-dark font-sans text-[17px] leading-snug font-semibold tracking-tight group-data-[size=sm]/card:text-[15px]',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'text-apple-ink-muted-48 group-data-[variant=dark]/card:text-apple-body-muted font-sans text-sm leading-normal font-normal',
        className,
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        'text-apple-ink group-data-[variant=dark]/card:text-apple-on-dark px-(--card-spacing) pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'rounded-b-apple-lg border-apple-divider-soft bg-apple-canvas-parchment/60 group-data-[variant=dark]/card:border-apple-surface-tile-2 group-data-[variant=dark]/card:bg-apple-surface-tile-2/50 flex items-center border-t px-(--card-spacing) py-4',
        className,
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
