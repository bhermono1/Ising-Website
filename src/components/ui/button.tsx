import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary to-violet text-primary-foreground shadow-[0_0_20px_rgba(255,45,120,0.35)] hover:shadow-[0_0_32px_rgba(255,45,120,0.55)] hover:-translate-y-0.5",
        secondary:
          "bg-surface-2 text-foreground border border-border hover:border-secondary hover:text-secondary",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary hover:text-primary",
        ghost: "bg-transparent text-foreground hover:bg-surface-2",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "bg-transparent text-primary underline-offset-4 hover:underline p-0",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";
