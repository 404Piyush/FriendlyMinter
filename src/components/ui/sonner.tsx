"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          boxShadow: "0 12px 30px -10px rgba(20, 20, 18, 0.18)",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }