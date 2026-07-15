import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-all disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_8px_24px_rgba(243,107,33,.35)] hover:-translate-y-0.5",
        secondary: "bg-gradient-to-br from-secondary to-secondary-dark text-white hover:-translate-y-0.5",
        navy: "bg-navy text-white hover:-translate-y-0.5",
        ghost: "bg-white text-heading border border-border hover:bg-primary-light",
        ghostDark: "bg-white/10 text-white border border-white/15 backdrop-blur hover:bg-white/20",
        outline: "border border-border bg-transparent text-heading hover:bg-bg",
        danger: "bg-danger text-white hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
