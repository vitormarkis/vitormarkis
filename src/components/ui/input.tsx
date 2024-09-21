import * as React from "react"

import { cn } from "~/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  facade?: boolean
}

export const Input_borderCls = "focus-visible:border-sky-500 border border-neutral-200"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ facade, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full bg-white px-3 py-2 text-sm selection:bg-sky-500 selection:text-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          {
            [Input_borderCls]: !facade,
            "h-full w-full": facade,
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
