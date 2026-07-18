import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium rounded-xl cursor-pointer select-none transition-shadow duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none aria-invalid:ring-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:brightness-95 active:brightness-90",
        neu:
          "bg-background text-foreground shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(150,130,100,0.28)] hover:shadow-[-2px_-2px_4px_rgba(255,255,255,0.9),2px_2px_4px_rgba(150,130,100,0.28)] active:shadow-[inset_3px_3px_6px_rgba(150,130,100,0.28),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]",
        outline:
          "bg-background text-foreground shadow-[-2px_-2px_4px_rgba(255,255,255,0.9),2px_2px_4px_rgba(150,130,100,0.28)] hover:shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(150,130,100,0.28)] active:shadow-[inset_2px_2px_4px_rgba(150,130,100,0.28),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]",
        ghost:
          "bg-transparent text-foreground hover:bg-background",
        link:
          "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-14 px-7 has-[>svg]:px-6 text-base",
        icon: "size-11 [&_svg]:size-4",
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
