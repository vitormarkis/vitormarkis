import React from "react"
import { cn } from "~/lib/utils"

export type SectionProps = React.ComponentPropsWithoutRef<"div">

export const Section = React.forwardRef<React.ElementRef<"div">, SectionProps>(
  function SectionComponent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}
        {...props}
      />
    )
  }
)
