import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 active:scale-[0.95] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-apple-primary text-apple-on-primary hover:bg-apple-primary-focus",
        outline: "border border-apple-primary text-apple-primary bg-transparent hover:bg-apple-primary/5",
        secondary: "bg-apple-surface-pearl text-apple-ink-muted-80 border-[3px] border-apple-divider-soft hover:bg-apple-divider-soft/50",
        ghost: "hover:bg-apple-surface-chip-translucent/20 text-apple-ink",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-apple-primary underline-offset-4 hover:underline bg-transparent",
        darkUtility: "bg-apple-ink text-apple-on-dark hover:opacity-90",
        iconCircular: "bg-apple-surface-chip-translucent text-apple-ink rounded-apple-full hover:bg-apple-surface-chip-translucent/80",
      },
      size: {
        default: "py-[11px] px-[22px] rounded-apple-pill text-apple-body font-normal gap-1.5",
        xs: "py-1 px-2.5 rounded-apple-xs text-apple-fine-print font-normal gap-1",
        sm: "py-[8px] px-[15px] rounded-apple-sm text-apple-button-utility font-normal gap-1",
        md: "py-[8px] px-[14px] rounded-apple-md text-apple-caption font-normal gap-1",
        lg: "py-[14px] px-[28px] rounded-apple-pill text-apple-button-large font-light gap-2",
        icon: "size-11 rounded-apple-full justify-center p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
