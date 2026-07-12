import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-apple-sm border border-apple-hairline bg-apple-canvas px-3 py-1.5 font-text text-[15px] text-apple-ink placeholder:text-apple-ink-muted-48 transition-all outline-none focus-visible:border-apple-primary-focus focus-visible:ring-1 focus-visible:ring-apple-primary-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-apple-canvas-parchment aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
