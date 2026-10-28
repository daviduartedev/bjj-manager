import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { PageHeaderAction } from "@/lib/painel/page-frame";
import { resolvePageHeader } from "@/lib/painel/page-frame";
import { primaryActionClass, secondaryActionClass } from "@/lib/ui/form-chrome";

export const routeTones = {
  rose: "bg-primary/10 text-primary",
  sky: "bg-[hsl(var(--status-info)/0.12)] text-[hsl(var(--status-info-foreground))]",
  emerald: "bg-[hsl(var(--status-paid)/0.12)] text-[hsl(var(--status-paid-foreground))]",
  amber: "bg-[hsl(var(--status-pending)/0.18)] text-[hsl(var(--status-pending-foreground))]",
  violet: "bg-foreground/[0.07] text-foreground",
  orange: "bg-[hsl(var(--brand-yellow)/0.2)] text-[hsl(var(--status-pending-foreground))]",
} as const;

export type RouteTone = keyof typeof routeTones;

export type RouteHeaderLink = PageHeaderAction & {
  icon?: ReactNode;
};

type ActionSlot = RouteHeaderLink | readonly RouteHeaderLink[] | null | undefined;

type RouteHeaderProps = {
  title: string;
  emoji: string;
  context?: string;
  icon: LucideIcon;
  tone?: RouteTone;
  primary?: ActionSlot;
  secondary?: ActionSlot;
  extra?: ReactNode;
};

export function RouteHeader(props: RouteHeaderProps) {
  const actions = resolvePageHeader({ primary: props.primary, secondary: props.secondary });
  const primaryIcon = iconFor(actions.primary, props.primary);
  const secondaryIcon = iconFor(actions.secondary, props.secondary);

  return (
    <header className="sticky top-0 z-20 -mx-3 mb-3 border-b border-border bg-background px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:-mx-4 sm:px-4 lg:-mx-6 lg:mb-5 lg:px-6 lg:pt-4">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-[-0.02em] lg:text-2xl">
            {props.title} <span aria-hidden>{props.emoji}</span>
          </h1>
          {props.context ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{props.context}</p>
          ) : null}
        </div>
        {actions.primary || actions.secondary || props.extra ? (
          <div className="flex shrink-0 items-center justify-end gap-2">
            {actions.primary ? (
              <Button className={primaryActionClass} asChild>
                <Link href={actions.primary.href}>
                  {primaryIcon}
                  {actions.primary.label}
                </Link>
              </Button>
            ) : null}
            {actions.secondary ? (
              <Button variant="outline" className={secondaryActionClass} asChild>
                <Link href={actions.secondary.href}>
                  {secondaryIcon}
                  {actions.secondary.label}
                </Link>
              </Button>
            ) : null}
            {props.extra}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function iconFor(action: PageHeaderAction | null, slot: ActionSlot): ReactNode {
  if (!action || slot == null) return null;
  const list = Array.isArray(slot) ? slot : [slot];
  return list.find((item) => item.label === action.label && item.href === action.href)?.icon ?? null;
}
