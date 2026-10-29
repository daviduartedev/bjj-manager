import Link from "next/link";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { LpReveal } from "@/components/marketing/lp-primitives";

const columns = [
  {
    title: "Produto",
    links: [
      { href: "/#sistema", label: "Sistema" },
      { href: "/#como-funciona", label: "Como funciona" },
      { href: "/#faixas", label: "Faixas e graus" },
      { href: "/#planos", label: "Planos" },
      { href: "/#faq", label: "Dúvidas" },
    ],
  },
  {
    title: "Conta",
    links: [
      { href: "/register", label: "Criar academia" },
      { href: "/login", label: "Entrar" },
      { href: "/recuperar-senha", label: "Recuperar senha" },
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

export function LpFooter() {
  return (
    <footer className="relative z-10 -mt-8 rounded-t-[2.5rem] border-t border-black/[0.08] bg-[#f4f6f8] text-foreground sm:rounded-t-[3rem]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
        <LpReveal direction="left">
          <CascaNavLogo tone="light-bg" imgClassName="h-8 sm:h-9" />
        </LpReveal>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {columns.map((column, index) => (
            <LpReveal key={column.title} direction={index % 2 === 0 ? "left" : "up"} delay={index * 0.08}>
            <div>
              <p className="text-sm font-semibold text-foreground">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            </LpReveal>
          ))}
        </div>

        <LpReveal direction="right">
          <div className="mt-14 flex flex-col gap-4 border-t border-black/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-sm text-muted-foreground">Feito no Brasil para quem mantém a academia em movimento.</p>
          </div>
        </LpReveal>

        <LpReveal direction="up" delay={0.08}>
          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            O Casca acompanha alunos, faixas, aulas e mensalidades. A assinatura da plataforma é cobrada pelo
            AbacatePay; as mensalidades dos alunos continuam sob controle da academia. Consulte os{" "}
            <Link href="/termos" className="underline underline-offset-2">Termos de Uso</Link> e a{" "}
            <Link href="/privacidade" className="underline underline-offset-2">Política de Privacidade</Link>.
          </p>
        </LpReveal>
      </div>
    </footer>
  );
}
