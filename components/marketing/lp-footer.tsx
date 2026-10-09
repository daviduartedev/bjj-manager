import { ArrowUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


const columns = [
  {
    title: "Produto",
    links: [
      { href: "/#sistema", label: "O sistema rodando" },
      { href: "/#funcionalidades", label: "Funcionalidades" },
      { href: "/#faixas", label: "Faixas e graus" },
      { href: "/#como-funciona", label: "Como funciona" },
    ],
  },
  {
    title: "Para quem",
    links: [
      { href: "/#para-quem", label: "Quem administra" },
      { href: "/#para-quem", label: "Quem ensina" },
      { href: "/#para-quem", label: "Quem treina" },
    ],
  },
  {
    title: "Confiança",
    links: [
      { href: "/#seguranca", label: "Segurança e escopo" },
      { href: "/#faq", label: "Perguntas frequentes" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos", label: "Termos de Uso" },
      { href: "/privacidade", label: "Política de Privacidade" },
    ],
  },
] as const;

const badges = ["Multi-academia", "Adulto e Kids", "Portal do aluno opcional"] as const;

export function LpFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[380px] w-[880px] -translate-x-1/2 rounded-full bg-[#BF1E27]/20 blur-[140px]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-16 sm:px-10 lg:px-16 lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)] lg:gap-20">
          {/* Marca */}
          <div>
            <Link href="/#top" aria-label="Casca — voltar ao topo" className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Image
                src="/marketing/casca-wordmark-transparent.png"
                alt="Casca"
                width={577}
                height={105}
                quality={100}
                className="h-11 w-auto sm:h-14"
              />
            </Link>
            <p className="mt-6 max-w-sm leading-relaxed text-white/60">
              Software web para gestão de academia de jiu-jitsu. Alunos, faixa e grau, mensalidade e
              painel do dia no mesmo sistema.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Destaques do produto">
              {badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/70"
                >
                  {badge}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 inline-flex h-11 items-center rounded-full bg-bjj-red px-7 text-sm font-semibold text-white outline-none transition-colors hover:bg-[#d32a34] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Acessar o sistema
            </Link>
          </div>

          {/* Navegação */}
          <nav className="grid grid-cols-2 gap-10 sm:grid-cols-4" aria-label="Rodapé">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  {col.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 outline-none transition-colors hover:text-white focus-visible:text-white focus-visible:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        {/* Barra final */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Casca. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/termos" className="hover:text-white">
              Termos
            </Link>
            <Link href="/privacidade" className="hover:text-white">
              Privacidade
            </Link>
            <Link
              href="/#top"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white"
            >
              Voltar ao topo
              <ArrowUp className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
