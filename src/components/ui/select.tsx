import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-heading outline-none transition-shadow",
        "focus:ring-2 focus:ring-primary/25 focus:border-primary",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
export { Select };
