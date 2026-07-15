import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-heading outline-none transition-shadow placeholder:text-muted min-h-[80px]",
        "focus:ring-2 focus:ring-primary/25 focus:border-primary",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
export { Textarea };
