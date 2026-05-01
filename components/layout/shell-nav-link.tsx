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
};

export function ShellNavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
  className,
  variant = "sidebar",
}: ShellNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  const base =
    variant === "sidebar"
      ? "group/nav flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-crm-sm font-medium transition-[color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--shell-active))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--shell-chrome))]"
      : "flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium leading-tight transition-colors duration-200 sm:text-xs";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        base,
        variant === "sidebar" &&
          (active
            ? "bg-[hsl(var(--shell-nav-active-bg)/0.95)] text-[hsl(var(--shell-active))] shadow-[inset_3px_0_0_hsl(var(--shell-active)),inset_0_1px_0_hsl(var(--shell-chrome-foreground)/0.06)]"
            : "text-[hsl(var(--shell-chrome-foreground))/0.88] hover:bg-[hsl(var(--shell-nav-hover-bg)/0.85)] hover:text-[hsl(var(--shell-chrome-foreground))]"),
        variant === "bottom" &&
          (active
            ? "text-[hsl(var(--shell-active))]"
            : "text-[hsl(var(--shell-chrome-foreground))/0.78] hover:text-[hsl(var(--shell-chrome-foreground))]"),
        variant === "bottom" &&
          active &&
          "bg-[hsl(var(--shell-nav-active-bg)/0.9)] shadow-[inset_0_-2px_0_hsl(var(--shell-active))]",
        className,
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "size-5 shrink-0 transition-colors duration-200",
          variant === "sidebar" && !active && "text-[hsl(var(--status-info)/0.85)] group-hover/nav:text-[hsl(var(--shell-chrome-foreground))/0.95]",
          variant === "sidebar" && active && "text-[hsl(var(--shell-active))]",
          variant === "bottom" && active && "drop-shadow-[0_0_10px_hsl(var(--shell-active)/0.45)]",
        )}
        aria-hidden
      />
      <span className={variant === "bottom" ? "line-clamp-2 w-full text-center" : ""}>{label}</span>
    </Link>
  );
}
