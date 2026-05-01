import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DashboardPageHeroProps = {
  /** Texto do badge (mesmo estilo “Gestão operacional”). */
  badge?: string;
  title: string;
  description?: string;
  /** Ex.: `DashboardBackLink` */
  intro?: React.ReactNode;
  /** Coluna direita: estatísticas, CTAs */
  aside?: React.ReactNode;
  /** Abaixo da descrição (alertas, notas). */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Cabeçalho de página na área autenticada — plano de fundo contínuo com o canvas (evita “card” sobre a vista).
 */
export function DashboardPageHero({
  badge,
  title,
  description,
  intro,
  aside,
  children,
  className,
}: DashboardPageHeroProps) {
  return (
    <section
      className={cn(
        "border-b border-border/80 pb-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 max-w-2xl space-y-3">
          {intro ? <div className="pb-1">{intro}</div> : null}
          {badge ? (
            <Badge
              variant="outline"
              className="w-fit border-border bg-background/90 font-medium text-muted-foreground shadow-sm"
            >
              {badge}
            </Badge>
          ) : null}
          <h1 className="type-page-title">{title}</h1>
          {description ? <p className="type-lead max-w-xl">{description}</p> : null}
          {children}
        </div>
        {aside ? (
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-stretch lg:flex-col xl:flex-row xl:items-start">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}
