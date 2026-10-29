import Link from "next/link";

const columns = [
  {
    title: "Produto",
    links: [
      { href: "/#sistema", label: "Sistema" },
      { href: "/#funcionalidades", label: "Funcionalidades" },
      { href: "/#como-funciona", label: "Como funciona" },
      { href: "/#faixas", label: "Faixas e graus" },
      { href: "/#planos", label: "Planos" },
      { href: "/#faq", label: "FAQ" },
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
    <footer className="relative z-10 -mt-8 rounded-t-[2.5rem] bg-[#163c31] text-white sm:rounded-t-[3rem]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-white">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold tracking-tight">Casca</p>
          <p className="text-sm text-white/60">
            A plataforma brasileira para gestão de academias de artes marciais.
          </p>
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-white/50">
          O Casca organiza alunos, faixas, aulas e mensalidades da academia. A cobrança da assinatura da
          plataforma é feita pelo AbacatePay. As mensalidades dos alunos continuam no controle da academia.
          Consulte os <Link href="/termos" className="underline underline-offset-2">Termos de Uso</Link> e a{" "}
          <Link href="/privacidade" className="underline underline-offset-2">Política de Privacidade</Link>.
        </p>
      </div>
    </footer>
  );
}
