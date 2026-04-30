import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Status financeiros / graduacao usados em todo o app
        paid:
          "border-transparent bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid))]",
        pending:
          "border-transparent bg-[hsl(var(--status-pending)/0.18)] text-[hsl(43_80%_30%)]",
        overdue:
          "border-transparent bg-[hsl(var(--status-overdue)/0.12)] text-[hsl(var(--status-overdue))]",
        info:
          "border-transparent bg-[hsl(var(--status-info)/0.12)] text-[hsl(var(--status-info))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
