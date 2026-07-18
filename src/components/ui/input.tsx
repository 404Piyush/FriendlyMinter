import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-ink-faint selection:bg-primary selection:text-primary-foreground flex h-11 w-full min-w-0 rounded-xl bg-background px-4 py-1 text-base shadow-[inset_2px_2px_4px_rgba(150,130,100,0.28),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] outline-none transition-shadow duration-150 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:shadow-[inset_3px_3px_6px_rgba(150,130,100,0.32),inset_-3px_-3px_6px_rgba(255,255,255,1)]",
        "aria-invalid:shadow-[inset_2px_2px_4px_rgba(220,40,40,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
