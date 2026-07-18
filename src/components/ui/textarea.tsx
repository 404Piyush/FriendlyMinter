import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground/60 flex field-sizing-content min-h-16 w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
