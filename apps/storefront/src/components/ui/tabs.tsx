'use client'

import * as React from 'react'

import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Tabs({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('border-apple-hairline inline-flex w-full items-center justify-start gap-6 border-b', className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'text-apple-ink-muted-80 hover:text-apple-ink data-[state=active]:border-apple-primary data-[state=active]:text-apple-primary -mb-[1px] inline-flex cursor-pointer items-center justify-center border-b-2 border-transparent py-3 text-sm font-semibold whitespace-nowrap outline-hidden transition-all duration-150 select-none active:scale-95',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('pt-6 outline-hidden', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
