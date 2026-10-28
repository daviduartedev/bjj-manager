import { Check, GraduationCap, Store, UserRound } from "lucide-react";
import Image from "next/image";

import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpEyebrow, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const audiences = [
  {
    icon: Store,
    head: "bg-brand-blue text-white",
    chip: "bg-white text-brand-blue",
    leadTone: "text-white/80",
    check: "bg-brand-blue/10 text-brand-blue",
    title: "Quem administra a escola",
    lead: "O mês financeiro e o painel do dia, sem caderno.",
    items: [
      "Mensalidade do mês com status explícito",
      "Atrasos e vencimentos à vista",
      "Documentos e recibos com envio por WhatsApp",
    ],
  },
  {
    icon: GraduationCap,
    head: "bg-brand-green text-white",
    chip: "bg-white text-brand-green",
    leadTone: "text-white/80",
    check: "bg-brand-green/10 text-brand-green",
    title: "Quem ensina",
    lead: "Alunos, faixas e aulas no mesmo lugar.",
    items: [
      "Cadastro adulto e kids com ficha completa",
      "Promoção de grau ou faixa com histórico",
      "Alertas de graduação para não perder o momento",
    ],
  },
  {
    icon: UserRound,
    head: "bg-brand-yellow text-neutral-950",
    chip: "bg-neutral-950 text-brand-yellow",
    leadTone: "text-neutral-950/70",
    check: "bg-neutral-950 text-brand-yellow",
    title: "Quem treina",
    lead: "Um espaço próprio, quando a academia libera o portal.",
    items: [
      "Aulas e presença do aluno",
      "Situação financeira do próprio aluno",
      "Sem portal, o Casca segue só com a equipe",
    ],
  },
] as const;

export function LpAudience() {
  return (
    <LpSection id="para-quem" className="relative z-10 bg-background">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <LpReveal>
          <LpEyebrow>Para quem é</LpEyebrow>
          <LpDisplay surface="light" className="mt-4 text-balance text-[clamp(2.25rem,5vw,4rem)] sm:text-wrap">
            Cada pessoa da academia
            <span className="sm:hidden"> </span>
            <br className="hidden sm:block" />
            <span className="text-brand-blue">vê o que precisa</span>
          </LpDisplay>
        </LpReveal>

        <LpReveal delay={0.1} className="mx-auto w-full min-w-0 max-w-[16rem] sm:max-w-[18rem] lg:mx-0 lg:max-w-[22rem]">
          <Image
            src="/marketing/logo-emblem-light.png"
            alt="Casca — cobra, símbolo da academia"
            width={1024}
            height={1024}
            className="h-auto w-full select-none"
            style={{ width: "100%", height: "auto" }}
            data-testid="landing-snake-logo"
          />
        </LpReveal>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {audiences.map(({ icon: Icon, title, lead, items, head, chip, leadTone, check }, i) => (
          <LpReveal key={title} delay={i * 0.1} className="h-full">
            <div className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-black/[0.06] bg-neutral-50 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.3)]">
              <div className={`relative overflow-hidden p-7 sm:p-8 ${head}`}>
                <Icon
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 -right-4 h-32 w-32 opacity-[0.12] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <span className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl ${chip}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="relative mt-6 font-sans text-2xl font-bold tracking-[-0.03em]">{title}</p>
                <p className={`relative mt-2 lg:min-h-[3rem] ${leadTone}`}>{lead}</p>
              </div>
              <ul className="flex-1 space-y-3 p-7 sm:p-8">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                    <span className={`mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${check}`}>
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </LpReveal>
        ))}
      </div>

      <LpReveal className="mt-12 sm:mt-14">
        <LpPillCta strong="Quem administra e quem ensina" note="no mesmo sistema.">
          Criar academia para a equipe
        </LpPillCta>
      </LpReveal>
    </LpSection>
  );
}
