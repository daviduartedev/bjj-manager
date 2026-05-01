import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardBackLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/** Voltar padronizado (rotas operacionais). */
export function DashboardBackLink({ href, children, className }: DashboardBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1 text-crm-sm font-semibold text-[hsl(var(--status-info))] transition-colors hover:text-primary",
        className,
      )}
    >
      <ChevronLeft
        className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
        aria-hidden
      />
      {children}
    </Link>
  );
}
