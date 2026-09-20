import Link from "next/link";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { ProductFooter } from "@/components/layout/product-footer";
import { cn } from "@/lib/utils";

export function LpEnterLink({ className }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={cn(
        "inline-flex h-11 items-center justify-center bg-bjj-red px-6 text-sm font-semibold text-white",
        "outline-none ring-offset-black hover:bg-[#9a181f]",
        "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
        className,
      )}
    >
      Entrar
    </Link>
  );
}

export function LpHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={cn(
        "z-50 flex h-16 items-center justify-between gap-4 px-5 sm:h-[4.25rem] sm:px-10 lg:px-14",
        solid
          ? "relative border-b border-white/15 bg-black"
          : "fixed inset-x-0 top-0 bg-black",
      )}
    >
      <CascaNavLogo />
      <nav
        className="hidden items-center gap-8 text-sm text-white/70 md:flex"
        aria-label="Secções da página"
      >
        <a href="/#funcionalidades" className="hover:text-white">
          Sistema
        </a>
        <a href="/#faq" className="hover:text-white">
          Perguntas
        </a>
        <a href="/termos" className="hover:text-white">
          Termos
        </a>
        <a href="/privacidade" className="hover:text-white">
          Privacidade
        </a>
      </nav>
      <LpEnterLink />
    </header>
  );
}

export function LpFooter() {
  return (
    <footer className="border-t border-white/15 bg-black px-5 py-10 text-white sm:px-10 lg:px-14">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <CascaNavLogo asLink={false} imgClassName="sm:h-9" />
        <div className="flex flex-col gap-4 text-sm text-white/60 sm:items-end sm:text-right">
          <p className="max-w-sm">
            Software web para gestão de academia de jiu-jitsu. Alunos, faixa, mensalidade e painel no mesmo sistema.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Documentos legais">
            <Link href="/termos" className="text-white hover:text-white">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-white hover:text-white">
              Política de Privacidade
            </Link>
          </nav>
          <ProductFooter surface="dark" />
        </div>
      </div>
    </footer>
  );
}
