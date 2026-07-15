import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-heading outline-none transition-shadow placeholder:text-muted",
        "focus:ring-2 focus:ring-primary/25 focus:border-primary",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
