import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "danger" | "warning" }) {
  const tones = {
    default: "bg-primary-light text-primary-dark border-primary/20",
    success: "bg-secondary-light text-secondary-dark border-secondary/20",
    danger: "bg-red-50 text-danger border-danger/20",
    warning: "bg-amber-50 text-warning border-warning/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
