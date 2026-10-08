import Link from "next/link";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// LpEnterLink — pill CTA button
// ---------------------------------------------------------------------------

export function LpEnterLink({ className }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full bg-bjj-red px-6 text-sm font-semibold text-white transition-colors hover:bg-[#d32a34]",
        "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className,
      )}
    >
      Entrar
    </Link>
  );
}

const NAV = [
  { href: "/#funcionalidades", label: "Sistema" },
  { href: "/#faq", label: "FAQ" },
] as const;

// ---------------------------------------------------------------------------
// LpHeader — barra inteira: marca, links e ação
// ---------------------------------------------------------------------------

export function LpHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={cn(
        "z-50 border-b border-white/10 bg-[#0b0d12]",
        solid ? "relative" : "fixed inset-x-0 top-0",
      )}
    >
      <div className="h-0.5 bg-bjj-red" />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-5 sm:px-10 lg:px-16">
        <CascaNavLogo imgClassName="h-6 sm:h-7" />
        <nav
          className="hidden flex-1 items-center justify-center gap-8 md:flex"
          aria-label="Secções da página"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 outline-none hover:text-white focus-visible:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/#funcionalidades"
            className="hidden h-9 items-center rounded-md border border-white/30 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white outline-none hover:border-white/60 focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
          >
            Ver o sistema
          </Link>
          <LpEnterLink className="h-9 rounded-md px-4 text-[11px] uppercase tracking-[0.14em]" />
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// LpFooter
// ---------------------------------------------------------------------------

export function LpFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#000000] px-5 py-12 text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <CascaNavLogo asLink={false} imgClassName="sm:h-9" />
        <div className="flex flex-col gap-4 text-sm text-white/60 sm:items-end sm:text-right">
          <p className="max-w-sm">
            Software web para gestão de academia de jiu-jitsu. Alunos, faixa, mensalidade e painel
            no mesmo sistema.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Documentos legais">
            <Link href="/termos" className="text-white/60 hover:text-white">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-white/60 hover:text-white">
              Política de Privacidade
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
