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
  default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
  primary: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100",
  overdue: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-100",
};

const bar: Record<DashboardStatTileAccent, string> = {
  default: "bg-zinc-300",
  primary: "bg-rose-500",
  paid: "bg-emerald-500",
  pending: "bg-amber-500",
  overdue: "bg-rose-600",
  info: "bg-sky-500",
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
        "flex h-full min-w-0 flex-col rounded-[20px] border border-black/[0.04] bg-white p-4 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] dark:border-border dark:bg-card sm:p-5",
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
      <p className="mt-1 font-display text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums [overflow-wrap:anywhere] sm:text-[2rem]">
        {value}
      </p>
    </div>
  );
}
