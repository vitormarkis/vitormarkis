import React from "react"
import { cn } from "~/lib/utils"

export type TagProps = React.ComponentPropsWithoutRef<"div">

export const Tag = React.forwardRef<React.ElementRef<"div">, TagProps>(
  function TagComponent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      />
    )
  }
)
