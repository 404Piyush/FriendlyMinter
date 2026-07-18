import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer select-none transition-[background-color,transform,box-shadow,color,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-ring aria-invalid:ring-destructive active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-sol-gradient-horizontal text-primary-foreground hover:opacity-90 shadow-[0_4px_18px_-6px_rgba(20,241,149,0.4)]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-secondary",
        link:
          "text-sol-gradient bg-transparent hover:underline underline-offset-4",
      },
      size: {
        default: "h-10 px-4 has-[>svg]:px-3",
        sm: "h-8 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-5 text-base",
        icon: "size-10 [&_svg]:size-4",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
