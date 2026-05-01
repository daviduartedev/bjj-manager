import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardStatTileProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
};

/** Métrica compacta no hero (total, contagens, etc.). */
export function DashboardStatTile({ label, value, icon: Icon, className }: DashboardStatTileProps) {
  return (
    <div
      className={cn(
        "flex min-w-[8.5rem] flex-col justify-center rounded-xl border border-border/80 bg-gradient-to-br from-muted/60 to-muted/30 px-4 py-3 shadow-inner ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
        className,
      )}
    >
      <span className="mb-1 block text-crm-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-2">
        {Icon ? <Icon className="size-5 shrink-0 text-[hsl(var(--status-info))]" aria-hidden /> : null}
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</span>
      </span>
    </div>
  );
}
