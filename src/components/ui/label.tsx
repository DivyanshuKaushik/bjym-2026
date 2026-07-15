import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, required, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("block text-[13px] font-bold text-heading mb-1.5", className)} {...props}>
      {children} {required && <span className="text-primary">*</span>}
    </label>
  );
}
