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
        "overflow-hidden rounded-[20px] border border-black/[0.04] bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] dark:border-border dark:bg-card",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-5 pt-5">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{title}</p>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <CardContent className={cn("p-5 sm:p-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
