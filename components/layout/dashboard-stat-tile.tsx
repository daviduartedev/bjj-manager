import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardStatTileAccent = "default" | "primary" | "paid" | "pending" | "overdue" | "info";

export type DashboardStatTileProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  accent?: DashboardStatTileAccent;
  className?: string;
};

const accentClasses: Record<DashboardStatTileAccent, string> = {
  default: "border-border bg-card hover:border-primary/25",
  primary:
    "border-primary/25 bg-gradient-to-br from-primary/[0.08] to-card hover:border-primary/40",
  paid: "dashboard-kpi-card--paid",
  pending: "dashboard-kpi-card--pending",
  overdue: "dashboard-kpi-card--overdue",
  info: "dashboard-kpi-card--info",
};

const iconAccentClasses: Record<DashboardStatTileAccent, string> = {
  default: "text-muted-foreground",
  primary: "text-primary",
  paid: "text-[hsl(var(--status-paid-foreground))]",
  pending: "text-[hsl(var(--status-pending-foreground))]",
  overdue: "text-[hsl(var(--status-overdue-foreground))]",
  info: "text-[hsl(var(--status-info-foreground))]",
};

/** Métrica compacta no hero (total, contagens, etc.). */
export function DashboardStatTile({
  label,
  value,
  icon: Icon,
  accent = "default",
  className,
}: DashboardStatTileProps) {
  const isKpiVariant = accent === "paid" || accent === "pending" || accent === "overdue" || accent === "info";

  return (
    <div
      className={cn(
        isKpiVariant ? "dashboard-kpi-card" : "flex min-w-[8.5rem] flex-col justify-center rounded-lg border px-4 py-3 shadow-sm transition-colors",
        accentClasses[accent],
        className,
      )}
    >
      <span className="mb-1 block text-crm-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-2">
        {Icon ? (
          <Icon className={cn("size-5 shrink-0", iconAccentClasses[accent])} aria-hidden />
        ) : null}
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</span>
      </span>
    </div>
  );
}
