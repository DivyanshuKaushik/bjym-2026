import * as React from "react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn("mt-0.5 h-4 w-4 shrink-0 accent-primary rounded", className)}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
export { Checkbox };
