import { CalendarCheck, ClipboardList, Rocket } from "lucide-react";

import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpEyebrow, LpReveal } from "@/components/marketing/lp-primitives";

const steps = [
  {
    icon: ClipboardList,
    title: "Cadastre a escola",
    body: "Aluno adulto ou kids, plano, faixa e grau de partida, contato e observações. A ficha nasce completa e organizada.",
    detail: "Adulto, Kids 1 e Kids 2",
  },
  {
    icon: Rocket,
    title: "Registre a rotina",
    body: "Promova grau ou faixa com data, confirme a mensalidade quando ela acontece e gere certificados e recibos.",
    detail: "Histórico que não se perde",
  },
  {
    icon: CalendarCheck,
    title: "Acompanhe o dia",
    body: "O painel mostra atrasos, aniversariantes e alertas de graduação. Você abre e já sabe onde agir.",
    detail: "Atalhos para agir no mesmo dia",
  },
] as const;

export function LpHowItWorks() {
  return (
    <section id="como-funciona" className="relative bg-background px-3 py-6 sm:px-4 lg:py-10">
      <div className="relative overflow-hidden rounded-[32px] bg-brand-blue px-5 py-20 text-white sm:rounded-[44px] sm:px-10 sm:py-28 lg:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-white/[0.06] blur-2xl"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <LpReveal>
            <LpEyebrow className="text-white/75">Como funciona</LpEyebrow>
            <LpDisplay surface="dark" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
              Da matrícula ao fim do mês,
              <br />
              <span className="text-brand-yellow">sem planilha solta</span>
            </LpDisplay>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg">
              Três movimentos simples que cobrem o dia a dia de quem ensina e de quem administra a escola.
            </p>
          </LpReveal>

          <div className="mt-14 grid gap-5 lg:mt-16 lg:grid-cols-3 lg:gap-6">
            {steps.map(({ icon: Icon, title, body, detail }, i) => (
              <LpReveal key={title} delay={i * 0.1} className="h-full">
                <article className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.08] p-6 backdrop-blur-sm transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:bg-white/[0.12] sm:p-8">
                  <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-blue">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <p className="relative mt-8 font-sans text-xl font-semibold tracking-[-0.02em] lg:text-2xl">
                    {title}
                  </p>
                  <p className="relative mt-3 flex-1 text-sm leading-relaxed text-white/75 sm:text-base">{body}</p>
                  <p className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-yellow px-3 py-1.5 text-xs font-semibold text-neutral-950 sm:text-sm">
                    {detail}
                  </p>
                </article>
              </LpReveal>
            ))}
          </div>

          <LpReveal className="mt-12 sm:mt-14">
            <LpPillCta tone="yellow" strong="Adulto, Kids 1 e Kids 2" note="no mesmo cadastro.">
              Começar o cadastro
            </LpPillCta>
          </LpReveal>
        </div>
      </div>
    </section>
  );
}
