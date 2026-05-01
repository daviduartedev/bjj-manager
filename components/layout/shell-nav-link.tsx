"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ShellNavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
  className?: string;
  variant?: "sidebar" | "bottom";
  /** Navegação sobre fundo escuro (sidebar preta — **BUI-8**). */
  surface?: "default" | "ink";
};

export function ShellNavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
  className,
  variant = "sidebar",
  surface = "default",
}: ShellNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  const ink = surface === "ink";

  const base =
    variant === "sidebar"
      ? cn(
          "group/nav flex min-h-10 w-full items-center gap-3 rounded-lg border-l-[3px] py-2 pl-[calc(0.75rem-3px)] pr-3 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          ink ? "text-sm leading-snug" : "text-crm-sm",
        )
      : "flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium leading-tight transition-colors duration-200 sm:text-xs";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        base,
        variant === "sidebar" &&
          (active
            ? ink
              ? "border-primary bg-primary/15 font-semibold text-primary"
              : "border-primary bg-primary/10 font-semibold text-primary"
            : ink
              ? "border-transparent text-zinc-200/95 hover:bg-white/[0.07] hover:text-white"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"),
        variant === "bottom" &&
          (active
            ? ink
              ? "font-semibold text-primary"
              : "font-semibold text-primary"
            : ink
              ? "text-zinc-300 hover:text-zinc-50"
              : "text-muted-foreground hover:text-foreground"),
        variant === "bottom" &&
          active &&
          (ink
            ? "bg-primary/15 shadow-[inset_0_-2px_0_0_hsl(var(--primary))]"
            : "bg-primary/10 shadow-[inset_0_-2px_0_0_hsl(var(--primary))]"),
        className,
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "size-5 shrink-0 transition-colors duration-200",
          variant === "sidebar" &&
            (active
              ? "text-primary"
              : ink
                ? "text-zinc-400 group-hover/nav:text-zinc-100"
                : "text-muted-foreground group-hover/nav:text-foreground"),
          variant === "bottom" && active && "text-primary",
          variant === "bottom" && !active && (ink ? "text-zinc-400" : "text-muted-foreground"),
        )}
        aria-hidden
      />
      <span className={variant === "bottom" ? "line-clamp-2 w-full text-center" : ""}>{label}</span>
    </Link>
  );
}
