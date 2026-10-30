import Link from "next/link";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { LpReveal } from "@/components/marketing/lp-primitives";

const NAV = [
  { href: "/#sistema", label: "Sistema" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#faixas", label: "Faixas e graus" },
  { href: "/#planos", label: "Planos" },
  { href: "/#faq", label: "Dúvidas" },
] as const;

const FOCUS =
  "outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function LpHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white/95 text-foreground backdrop-blur">
      <LpReveal onLoad direction="drop" duration={0.72}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-5 sm:gap-8 sm:px-10 lg:px-16">
        <CascaNavLogo tone="light-bg" imgClassName="h-9 sm:h-10" />
        <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex" aria-label="Seções da página">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-sm font-medium text-foreground/65 transition-colors hover:text-foreground ${FOCUS}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link href="/login" className={`text-sm font-medium text-foreground/65 hover:text-foreground ${FOCUS}`}>
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-blue px-4 text-xs font-semibold text-white outline-none transition-colors hover:bg-brand-blue/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="sm:hidden">Começar</span>
            <span className="hidden sm:inline">Organizar minha academia</span>
          </Link>
        </div>
      </div>
      </LpReveal>
    </header>
  );
}
