import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { PageHeaderAction } from "@/lib/painel/page-frame";
import { resolvePageHeader } from "@/lib/painel/page-frame";
import { cn } from "@/lib/utils";

export const routeTones = {
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-100",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-100",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-100",
} as const;

export type RouteTone = keyof typeof routeTones;

export type RouteHeaderLink = PageHeaderAction & {
  icon?: ReactNode;
};

type ActionSlot = RouteHeaderLink | readonly RouteHeaderLink[] | null | undefined;

type RouteHeaderProps = {
  title: string;
  context?: string;
  icon: LucideIcon;
  tone?: RouteTone;
  primary?: ActionSlot;
  secondary?: ActionSlot;
};

const primaryClass = "h-10 w-auto shrink-0 rounded-xl px-3.5 text-sm";

const secondaryClass =
  "h-10 w-auto shrink-0 rounded-xl border-2 border-zinc-950 bg-white px-3.5 text-sm text-zinc-950 hover:bg-zinc-950 hover:text-white dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-100 dark:hover:text-zinc-950";

export function RouteHeader(props: RouteHeaderProps) {
  const Icon = props.icon;
  const tone = routeTones[props.tone ?? "sky"];
  const actions = resolvePageHeader({ primary: props.primary, secondary: props.secondary });
  const primaryIcon = iconFor(actions.primary, props.primary);
  const secondaryIcon = iconFor(actions.secondary, props.secondary);

  return (
    <header className="sticky top-0 z-20 -mx-3 mb-3 border-b border-zinc-200 bg-[#f3f4f6] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:-mx-4 sm:px-4 lg:-mx-6 lg:mb-5 lg:px-6 lg:pt-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold tracking-tight lg:text-2xl">
            <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full lg:size-9", tone)}>
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 truncate">
              {props.title} <span aria-hidden>👏</span>
            </span>
          </h1>
          {props.context ? (
            <p className="mt-0.5 truncate pl-10 text-xs text-muted-foreground lg:pl-11">{props.context}</p>
          ) : null}
        </div>
        {actions.primary || actions.secondary ? (
          <div className="flex shrink-0 items-center justify-end gap-2">
            {actions.primary ? (
              <Button className={primaryClass} asChild>
                <Link href={actions.primary.href}>
                  {primaryIcon}
                  {actions.primary.label}
                </Link>
              </Button>
            ) : null}
            {actions.secondary ? (
              <Button variant="outline" className={secondaryClass} asChild>
                <Link href={actions.secondary.href}>
                  {secondaryIcon}
                  {actions.secondary.label}
                </Link>
              </Button>
            ) : null}
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
