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
        "overflow-hidden border-border/80 bg-card shadow-sm ring-1 ring-border/40",
        "border-l-[3px] border-l-primary/30",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-border/80 px-5 py-4",
          "bg-gradient-to-r from-[hsl(var(--content-wash-mid)/0.55)] via-muted/35 to-transparent",
        )}
      >
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.07] text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-crm-sm font-semibold text-foreground">{title}</p>
          {subtitle ? <p className="text-crm-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <CardContent className={cn("p-5 sm:p-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
