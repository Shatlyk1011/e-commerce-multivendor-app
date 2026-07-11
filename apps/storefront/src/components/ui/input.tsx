import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-apple-pill border border-apple-hairline bg-apple-canvas px-5 py-3 text-apple-body transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-apple-ink placeholder:text-apple-ink-muted-48 focus-visible:border-apple-primary-focus focus-visible:ring-2 focus-visible:ring-apple-primary-focus/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-apple-divider-soft/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
