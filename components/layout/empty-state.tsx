import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: LucideIcon;
  title: string;
  description?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn("dashboard-empty-state", className)}
      {...props}
    >
      {Icon ? (
        <span className="mb-4 flex size-12 items-center justify-center rounded-lg border border-[hsl(var(--status-info)/0.2)] bg-[hsl(var(--status-info)/0.08)] text-[hsl(var(--status-info-foreground))]">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <h3 className="type-card-heading">{title}</h3>
      {description ? (
        <p className="type-lead mt-1 max-w-sm">
          {description}
        </p>
      ) : null}
      {children ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
