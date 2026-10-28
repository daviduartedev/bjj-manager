import type { LucideIcon } from "lucide-react";
import { BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardStatTileAccent = "default" | "primary" | "paid" | "pending" | "overdue" | "info";

export type DashboardStatTileProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  accent?: DashboardStatTileAccent;
  className?: string;
};

const well: Record<DashboardStatTileAccent, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  paid: "bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid-foreground))]",
  pending: "bg-[hsl(var(--status-pending)/0.18)] text-[hsl(var(--status-pending-foreground))]",
  overdue: "bg-[hsl(var(--status-overdue)/0.12)] text-[hsl(var(--status-overdue-foreground))]",
  info: "bg-[hsl(var(--status-info)/0.12)] text-[hsl(var(--status-info-foreground))]",
};

const bar: Record<DashboardStatTileAccent, string> = {
  default: "bg-muted-foreground/40",
  primary: "bg-primary",
  paid: "bg-[hsl(var(--status-paid))]",
  pending: "bg-[hsl(var(--status-pending))]",
  overdue: "bg-[hsl(var(--status-overdue))]",
  info: "bg-[hsl(var(--status-info))]",
};

/** Indicador no mesmo cartão da home: ícone sólido, número e uma barra de cor. */
export function DashboardStatTile({
  label,
  value,
  icon: Icon = BarChart3,
  accent = "default",
  className,
}: DashboardStatTileProps) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col rounded-[20px] border border-border bg-card p-4 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full", well[accent])}>
          <Icon className="size-4" aria-hidden />
        </span>
        <span className={cn("mt-1 h-8 w-2 rounded-full", bar[accent])} aria-hidden />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-[1.65rem] font-semibold leading-none tracking-[-0.015em] tabular-nums [overflow-wrap:anywhere] sm:text-[2rem]">
        {value}
      </p>
    </div>
  );
}
