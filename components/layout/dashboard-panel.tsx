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
 * Painel de conteúdo com cabeçalho alinhado ao cartão de filtros de /alunos.
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
        "overflow-hidden border-border/90 shadow-md ring-1 ring-[hsl(var(--status-info))/0.14]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/70 bg-gradient-to-r from-muted/90 via-muted/50 to-[hsl(var(--status-info)/0.06)] px-4 py-3.5 sm:px-5">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background/90 text-[hsl(var(--status-info))] shadow-sm ring-1 ring-border/60">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-crm-sm font-semibold text-foreground">{title}</p>
          {subtitle ? <p className="text-crm-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <CardContent className={cn("p-4 sm:p-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
