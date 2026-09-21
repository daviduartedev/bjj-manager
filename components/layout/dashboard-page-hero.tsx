import * as React from "react";

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
 * Cabeçalho de página na área autenticada — lavagem contínua com acento BJJ (**DS-1.12**).
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
        "relative pb-8",
        "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/40 after:to-transparent",
        className,
      )}
    >
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="min-w-0 max-w-2xl space-y-3.5">
          {intro ? <div className="pb-0.5">{intro}</div> : null}
          {badge ? <span className="dashboard-hero-badge">{badge}</span> : null}
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
