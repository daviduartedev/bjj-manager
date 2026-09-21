import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardPanelProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Área de trabalho principal — chrome premium com acentos tokenizados (**BUI-8**, **DS-1.12**).
 */
export function DashboardPanel({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-lg border-border/80 bg-card shadow-sm",
        "border-l-[3px] border-l-primary",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/70 bg-muted/30 px-5 py-4">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/[0.08] text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="type-card-heading">{title}</p>
          {subtitle ? <p className="type-lead mt-0.5 text-crm-xs">{subtitle}</p> : null}
        </div>
      </div>
      <CardContent className={cn("p-5 sm:p-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
