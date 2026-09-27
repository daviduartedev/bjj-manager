// Which page frame should carry the home's visual system across the other logged-in screens?
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { PrototypeSwitcher } from "@/components/prototype/prototype-switcher";
import { Button } from "@/components/ui/button";
import {
  resolvePageHeader,
  pageFrameVariant,
  type PageFrameKey,
  type PageHeaderAction,
} from "@/lib/painel/page-frame";
import { cn } from "@/lib/utils";

const canvas = cn(
  "min-h-[calc(100dvh-3rem)] bg-[#f3f4f6] text-foreground dark:bg-zinc-950 lg:min-h-dvh",
  "px-3 pt-3 pb-28 sm:px-4 sm:pt-4 sm:pb-28 lg:px-6 lg:pt-6 lg:pb-20",
);

const card =
  "rounded-[20px] border border-black/[0.04] bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] dark:border-border dark:bg-card";

const titleClass =
  "font-display text-2xl font-semibold tracking-tight text-balance sm:text-[1.65rem]";

const contextClass = "text-sm text-muted-foreground";

const primaryClass =
  "h-12 rounded-xl px-4 text-sm shadow-[0_12px_28px_-16px_hsl(var(--primary))] sm:px-5 sm:text-base";

const secondaryClass =
  "h-12 rounded-xl border-2 border-zinc-950 bg-white px-4 text-sm text-zinc-950 hover:bg-zinc-950 hover:text-white dark:border-white dark:bg-card dark:text-foreground sm:px-5 sm:text-base";

export type PageFrameAction = PageHeaderAction & {
  icon?: ReactNode;
};

type ActionSlot = PageFrameAction | readonly PageFrameAction[] | null | undefined;

type PageFrameProps = {
  title: string;
  context: string;
  primary?: ActionSlot;
  secondary?: ActionSlot;
  children: ReactNode;
};

export function PageFrame(props: PageFrameProps) {
  return (
    <Suspense fallback={<PageFrameView variant="A" showSwitcher={false} {...props} />}>
      <PageFrameQuery {...props} />
    </Suspense>
  );
}

function PageFrameQuery(props: PageFrameProps) {
  const searchParams = useSearchParams();
  return <PageFrameView variant={pageFrameVariant(searchParams.get("variant"))} showSwitcher {...props} />;
}

function PageFrameView({
  variant,
  title,
  context,
  primary,
  secondary,
  children,
  showSwitcher,
}: PageFrameProps & { variant: PageFrameKey; showSwitcher: boolean }) {
  const actions = resolvePageHeader({ primary, secondary });
  const primaryIcon = iconFor(actions.primary, primary);
  const secondaryIcon = iconFor(actions.secondary, secondary);

  return (
    <div className={canvas} data-variant={variant} data-testid="page-frame">
      {variant === "B" ? (
        <Mesa
          title={title}
          context={context}
          primary={actions.primary}
          secondary={actions.secondary}
          primaryIcon={primaryIcon}
          secondaryIcon={secondaryIcon}
        >
          {children}
        </Mesa>
      ) : null}
      {variant === "C" ? (
        <Ficha
          title={title}
          context={context}
          primary={actions.primary}
          secondary={actions.secondary}
          primaryIcon={primaryIcon}
          secondaryIcon={secondaryIcon}
        >
          {children}
        </Ficha>
      ) : null}
      {variant === "A" ? (
        <Faixa
          title={title}
          context={context}
          primary={actions.primary}
          secondary={actions.secondary}
          primaryIcon={primaryIcon}
          secondaryIcon={secondaryIcon}
        >
          {children}
        </Faixa>
      ) : null}
      {showSwitcher ? <PrototypeSwitcher /> : null}
    </div>
  );
}

function Faixa(props: LayoutProps) {
  const both = Boolean(props.primary && props.secondary);
  return (
    <>
      <header className="mb-4 flex flex-col gap-4 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className={titleClass}>{props.title}</h1>
          <p className={cn("mt-1", contextClass)}>{props.context}</p>
        </div>
        <FrameActions
          width="row"
          className={
            both
              ? "grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:flex lg:justify-end"
              : "grid grid-cols-1 gap-2 lg:flex lg:justify-end"
          }
          primary={props.primary}
          secondary={props.secondary}
          primaryIcon={props.primaryIcon}
          secondaryIcon={props.secondaryIcon}
        />
      </header>
      {props.children}
    </>
  );
}

function Mesa(props: LayoutProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className={cn(titleClass, "min-w-0 truncate")}>{props.title}</h1>
        <FrameActions
          className="flex shrink-0 justify-end gap-2"
          primary={props.primary}
          secondary={props.secondary}
          primaryIcon={props.primaryIcon}
          secondaryIcon={props.secondaryIcon}
        />
      </div>
      <p className={cn("mt-2", contextClass)}>{props.context}</p>
      <div className={cn(card, "mt-3 p-4 sm:mt-4 sm:p-5")}>{props.children}</div>
    </>
  );
}

function Ficha(props: LayoutProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <div className="flex w-full shrink-0 flex-col gap-3 md:w-64">
        <h1 className={titleClass}>{props.title}</h1>
        <p className={contextClass}>{props.context}</p>
        <FrameActions
          className="flex flex-col gap-2"
          width="full"
          primary={props.primary}
          secondary={props.secondary}
          primaryIcon={props.primaryIcon}
          secondaryIcon={props.secondaryIcon}
        />
      </div>
      <div className="min-w-0 flex-1">{props.children}</div>
    </div>
  );
}

type LayoutProps = {
  title: string;
  context: string;
  primary: PageHeaderAction | null;
  secondary: PageHeaderAction | null;
  primaryIcon: ReactNode;
  secondaryIcon: ReactNode;
  children: ReactNode;
};

function FrameActions({
  primary,
  secondary,
  primaryIcon,
  secondaryIcon,
  className,
  width = "auto",
}: Omit<LayoutProps, "title" | "context" | "children"> & {
  className?: string;
  width?: "auto" | "row" | "full";
}) {
  if (!primary && !secondary) return null;
  const widthClass = width === "full" ? "w-full" : width === "row" ? "w-full lg:w-auto" : "w-auto";
  return (
    <div className={className}>
      {primary ? (
        <Button className={cn(primaryClass, widthClass)} asChild>
          <Link href={primary.href}>
            {primaryIcon}
            {primary.label}
          </Link>
        </Button>
      ) : null}
      {secondary ? (
        <Button variant="outline" className={cn(secondaryClass, widthClass)} asChild>
          <Link href={secondary.href}>
            {secondaryIcon}
            {secondary.label}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function iconFor(action: PageHeaderAction | null, slot: ActionSlot): ReactNode {
  if (!action || slot == null) return null;
  const list = Array.isArray(slot) ? slot : [slot];
  return list.find((item) => item.label === action.label && item.href === action.href)?.icon ?? null;
}
