import Link from "next/link";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { ProductFooter } from "@/components/layout/product-footer";
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

// ---------------------------------------------------------------------------
// LpHeader — floating pill nav (default) or solid bar (solid)
// ---------------------------------------------------------------------------

export function LpHeader({ solid = false }: { solid?: boolean }) {
  if (solid) {
    return (
      <header className="relative flex h-16 items-center justify-between border-b border-white/10 bg-black px-5 sm:px-10">
        <CascaNavLogo />
        <LpEnterLink />
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-3 z-50 sm:top-5">
      <div className="mx-auto flex h-12 w-fit max-w-[calc(100vw-1.5rem)] items-center gap-4 rounded-full border border-white/10 bg-black/70 px-4 shadow-[0_8px_30px_rgb(0_0_0/0.5)] backdrop-blur-md sm:h-14 sm:gap-6 sm:px-5">
        <CascaNavLogo imgClassName="h-5 sm:h-6" />
        <nav
          className="hidden items-center gap-6 text-sm text-white/65 md:flex"
          aria-label="Secções da página"
        >
          <Link href="/#funcionalidades" className="hover:text-white">
            Sistema
          </Link>
          <Link href="/#problema" className="hover:text-white">
            Problema
          </Link>
          <Link href="/#faq" className="hover:text-white">
            FAQ
          </Link>
        </nav>
        <span className="hidden h-4 w-px bg-white/15 md:block" aria-hidden />
        <LpEnterLink className="h-9 px-5" />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// LpFooter
// ---------------------------------------------------------------------------

export function LpFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-10 text-white sm:px-10 lg:px-14">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
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
          <ProductFooter surface="dark" />
        </div>
      </div>
    </footer>
  );
}
