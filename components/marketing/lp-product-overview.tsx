import { CalendarCheck, GraduationCap, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";

import { LpDisplay, LpMark, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const routines = [
  {
    icon: Users,
    eyebrow: "Cadastro",
    title: "Uma ficha que acompanha quem treina",
    body: "Adulto ou kids, contato, plano, faixa, grau e observações. O histórico continua com o aluno desde a matrícula.",
    detail: "Aluno ativo · faixa azul · grau 2",
    accent: "bg-brand-blue text-white",
  },
  {
    icon: GraduationCap,
    eyebrow: "Graduação",
    title: "Cada promoção deixa uma história",
    body: "Registre grau ou faixa com data e responsável. Se a ordem for pulada, o Casca pede a justificativa antes de concluir.",
    detail: "Promoção registrada em 08/10/2026",
    accent: "bg-brand-green text-white",
  },
  {
    icon: CalendarCheck,
    eyebrow: "Mensalidades",
    title: "O mês financeiro com status claro",
    body: "Veja vencimentos e atrasos por aluno. Quando o pagamento acontece na academia, você confirma o recebimento no Casca.",
    detail: "Outubro · recebido",
    accent: "bg-brand-yellow text-neutral-950",
  },
  {
    icon: LayoutDashboard,
    eyebrow: "Painel",
    title: "Abra o dia sabendo onde agir",
    body: "Alunos ativos, aniversariantes, mensalidades em atraso e alertas de graduação aparecem juntos no painel.",
    detail: "3 pendências pedem atenção hoje",
    accent: "bg-neutral-950 text-white",
  },
] as const;

export function LpProductOverview() {
  return (
    <LpSection id="funcionalidades" className="bg-[#f4f6f8]">
      <LpReveal>
        <LpDisplay surface="light" className="max-w-[17ch] text-[clamp(2.25rem,5vw,4rem)]">
          O Casca conhece o trabalho por trás de <LpMark>cada aula</LpMark>.
        </LpDisplay>
        <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
          A gestão não começa no relatório. Ela começa quando um aluno entra, muda de faixa, vence a
          mensalidade ou precisa de atenção. É essa rotina que o Casca organiza.
        </p>
      </LpReveal>

      <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-2">
          {routines.map(({ icon: Icon, eyebrow, title, body, detail, accent }, index) => (
            <LpReveal
              key={title}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={(index % 2) * 0.08}
              duration={1.02}
            >
            <article className="ease-lp-expo group rounded-[2rem] border border-black/[0.07] bg-white p-6 transition-transform duration-300 hover:-translate-y-2 sm:p-8">
              <div className={`inline-flex size-11 items-center justify-center rounded-2xl ${accent}`}>
                <Icon className="ease-lp-expo size-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden />
              </div>
              <p className="mt-8 text-sm font-semibold text-brand-blue">{eyebrow}</p>
              <h3 className="mt-2 max-w-[20ch] text-2xl font-bold leading-tight tracking-[-0.03em] text-foreground">
                {title}
              </h3>
              <p className="mt-4 max-w-[48ch] leading-relaxed text-muted-foreground">{body}</p>
              <p className="mt-7 border-t border-border pt-4 text-sm font-medium text-foreground">{detail}</p>
            </article>
            </LpReveal>
          ))}
      </div>

      <LpReveal className="mt-10 flex justify-center">
        <Link
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-blue px-6 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-blue/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Organizar minha academia
        </Link>
      </LpReveal>
    </LpSection>
  );
}
