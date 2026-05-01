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
 * Cabeçalho operacional padronizado (gradiente, blobs, hierarquia tipo /alunos).
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
        "relative overflow-hidden rounded-2xl border border-border/90 bg-card shadow-sm ring-1 ring-primary/[0.07]",
        className,
      )}
    >
      <div
        className="h-1.5 bg-gradient-to-r from-primary via-[hsl(var(--status-info))] to-[hsl(var(--status-paid))]"
        aria-hidden
      />
      <div className="relative p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-primary/[0.06] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-[hsl(var(--status-info)/0.08)] blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-3">
            {intro ? <div>{intro}</div> : null}
            {badge ? (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/[0.07] font-medium text-primary shadow-none"
              >
                {badge}
              </Badge>
            ) : null}
            <h1 className="type-page-title">{title}</h1>
            {description ? <p className="type-lead max-w-lg">{description}</p> : null}
            {children}
          </div>
          {aside ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch lg:flex-col xl:flex-row xl:items-center">
              {aside}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
