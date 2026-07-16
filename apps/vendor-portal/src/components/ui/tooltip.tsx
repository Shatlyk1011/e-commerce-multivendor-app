import * as React from 'react'

import { HelpCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  className?: string
}

function Tooltip({ content, className }: TooltipProps) {
  return (
    <span
      className={cn(
        'group text-apple-ink-muted-48 hover:text-apple-ink relative ml-1.5 inline-flex cursor-help items-center transition-colors',
        className,
      )}
    >
      <HelpCircle className="size-3.5" />
      <span className="rounded-apple-sm bg-apple-ink text-apple-canvas-parchment pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 p-2 text-center text-[12px] leading-normal font-normal normal-case opacity-0 shadow-md transition-opacity duration-200 select-none group-hover:pointer-events-auto group-hover:opacity-100">
        {content}
        <span className="bg-apple-ink absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45" />
      </span>
    </span>
  )
}

export { Tooltip }
