import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-foreground border border-border",
        primary: "bg-primary/15 text-primary border border-primary/30",
        secondary: "bg-secondary/15 text-secondary border border-secondary/30",
        accent: "bg-accent/15 text-accent border border-accent/30",
        success: "bg-success/15 text-success border border-success/30",
        destructive: "bg-destructive/15 text-destructive border border-destructive/30",
        outline: "border border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
