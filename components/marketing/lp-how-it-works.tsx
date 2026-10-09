import { CalendarCheck, ClipboardList, Rocket } from "lucide-react";

import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

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
    <LpSection id="como-funciona" className="relative z-10 overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-[#BF1E27]/20 blur-[120px]"
      />
      <LpReveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bjj-red">Como funciona</p>
        <LpDisplay className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
          Da matrícula ao fim do mês,
          <br />
          sem planilha solta
        </LpDisplay>
        <p className="mt-6 max-w-[52ch] leading-relaxed text-white/60">
          Três movimentos simples que cobrem o dia a dia de quem ensina e de quem administra a escola.
        </p>
      </LpReveal>

      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        {/* trilho que liga as etapas (desktop) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[16%] right-[16%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent md:block"
        />
        {steps.map(({ icon: Icon, title, body, detail }, i) => (
          <LpReveal key={title} delay={i * 0.1} className="h-full">
            <div className="group relative h-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
              <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bjj-red text-white shadow-[0_14px_30px_-10px_rgba(191,30,39,0.9)]">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-8 font-sans text-2xl font-semibold tracking-[-0.02em]">{title}</p>
              <p className="mt-3 leading-relaxed text-white/60">{body}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-bjj-red" />
                {detail}
              </p>
            </div>
          </LpReveal>
        ))}
      </div>
    </LpSection>
  );
}
