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
 * Área de trabalho principal por página, uma superfície, hierarquia simples (padrão SaaS).
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
        "overflow-hidden border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-5 py-4">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
            <Icon className="size-4 text-muted-foreground" aria-hidden />
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
