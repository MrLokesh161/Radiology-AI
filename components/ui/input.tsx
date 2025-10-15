import type * as React from "react"

import { cn } from "@/lib/utils"

// Disallow children and dangerouslySetInnerHTML on input
type InputProps = Omit<React.ComponentProps<"input">, "children" | "dangerouslySetInnerHTML">

function Input({ className, type, ...props }: InputProps) {
  // strip any mistakenly passed children or dangerouslySetInnerHTML at runtime
  const {
    // @ts-expect-error - hardening: ignore children on input at runtime
    children: _ignoredChildren,
    // @ts-expect-error - hardening: ignore DSIH on input at runtime
    dangerouslySetInnerHTML: _ignoredDSIH,
    ...rest
  } = props as Record<string, unknown>

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  )
}

export { Input }
