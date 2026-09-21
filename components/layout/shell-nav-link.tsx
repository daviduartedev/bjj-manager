"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { isShellNavActive } from "@/lib/layout/shell-nav";
import { cn } from "@/lib/utils";

export type ShellNavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
  className?: string;
  variant?: "sidebar" | "bottom";
  /** Navegação sobre fundo escuro (sidebar preta, **BUI-8**). */
  surface?: "default" | "ink";
  /** Marcador para o tour guiado (mesmo valor em desktop e mobile). */
  dataTour?: string;
};

export function ShellNavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
  className,
  variant = "sidebar",
  surface = "default",
  dataTour,
}: ShellNavLinkProps) {
  const pathname = usePathname();
  const active = isShellNavActive(pathname, href);

  const ink = surface === "ink";

  const base =
    variant === "sidebar"
      ? cn(
          "group/nav flex min-h-11 w-full items-center gap-3 rounded-md border-l-[3px] py-2 pl-[calc(0.75rem-3px)] pr-3 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          ink
            ? "text-sm leading-snug focus-visible:ring-offset-[hsl(var(--secondary))]"
            : "text-crm-sm focus-visible:ring-offset-background",
        )
      : "flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-[10px] font-medium leading-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--secondary))] sm:text-xs";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-tour={dataTour}
      className={cn(
        base,
        variant === "sidebar" &&
          (active
            ? ink
              ? "border-primary bg-[hsl(var(--shell-nav-active-bg))] font-semibold text-primary"
              : "border-primary bg-primary/10 font-semibold text-primary"
            : ink
              ? "border-transparent text-secondary-foreground/80 hover:bg-[hsl(var(--shell-nav-hover-bg))] hover:text-secondary-foreground"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"),
        variant === "bottom" &&
          (active
            ? "font-semibold text-primary"
            : ink
              ? "text-secondary-foreground/70 hover:text-secondary-foreground"
              : "text-muted-foreground hover:text-foreground"),
        variant === "bottom" &&
          active &&
          (ink
            ? "bg-[hsl(var(--shell-nav-active-bg))] shadow-[inset_0_-2px_0_0_hsl(var(--primary))]"
            : "bg-primary/10 shadow-[inset_0_-2px_0_0_hsl(var(--primary))]"),
        className,
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "size-5 shrink-0 transition-colors duration-150",
          variant === "sidebar" &&
            (active
              ? "text-primary"
              : ink
                ? "text-secondary-foreground/45 group-hover/nav:text-secondary-foreground"
                : "text-muted-foreground group-hover/nav:text-foreground"),
          variant === "bottom" && active && "text-primary",
          variant === "bottom" &&
            !active &&
            (ink ? "text-secondary-foreground/45" : "text-muted-foreground"),
        )}
        aria-hidden
      />
      <span className={variant === "bottom" ? "line-clamp-2 w-full text-center" : ""}>{label}</span>
    </Link>
  );
}
