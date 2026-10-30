import Link from "next/link";

import { CascaNavLogo } from "@/components/marketing/casca-nav-logo";
import { LP_NAVIGATION } from "@/components/marketing/lp-navigation";

const COLUMNS = [
  { title: "Conheça o Casca", links: LP_NAVIGATION },
  { title: "Sua conta", links: [
    { href: "/register", label: "Criar academia" },
    { href: "/login", label: "Entrar" },
    { href: "/recuperar-senha", label: "Recuperar senha" },
  ] },
  { title: "Com transparência", links: [
    { href: "/termos", label: "Termos de Uso" },
    { href: "/privacidade", label: "Política de Privacidade" },
  ] },
];

export function LpFooter() {
  return (
    <footer className="border-t border-border bg-white text-foreground">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <CascaNavLogo tone="light-bg" imgClassName="h-9" />
            <p className="mt-5 max-w-[29ch] text-sm leading-relaxed text-muted-foreground">Feito no Brasil, junto de quem faz a academia acontecer.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map(({ title, links }) => (
              <div key={title}>
                <h3 className="text-sm font-semibold">{title}</h3>
                <ul className="mt-3">
                  {links.map(({ href, label }) => (
                    <li key={href}><Link href={href} className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          A assinatura do Casca é processada pela AbacatePay. As mensalidades dos alunos são recebidas pela academia e registradas no Casca.
        </p>
      </div>
    </footer>
  );
}
