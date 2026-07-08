import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground/70 flex field-sizing-content min-h-16 w-full rounded-[3px] border border-border bg-transparent px-3 py-2 text-sm shadow-none outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
