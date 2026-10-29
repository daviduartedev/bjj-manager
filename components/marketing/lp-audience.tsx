import { GraduationCap, Store, UserRound } from "lucide-react";
import Image from "next/image";

import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpEyebrow, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const audiences = [
  {
    icon: Store,
    accent: "text-brand-blue",
    iconWrap: "bg-brand-blue text-white",
    title: "Quem administra a academia",
    lead: "O mês financeiro e o painel do dia, sem caderno.",
    items: [
      "Mensalidade do mês com status explícito",
      "Atrasos e vencimentos à vista",
      "Documentos e recibos com envio por WhatsApp",
    ],
  },
  {
    icon: GraduationCap,
    accent: "text-brand-green",
    iconWrap: "bg-brand-green text-white",
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
    accent: "text-foreground",
    iconWrap: "bg-brand-yellow text-neutral-950",
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
    <LpSection id="para-quem" className="relative z-10 bg-white">
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

      <div className="mt-16 grid gap-12 border-t border-black/[0.06] pt-12 lg:grid-cols-3 lg:gap-16">
        {audiences.map(({ icon: Icon, title, lead, items, iconWrap, accent }, i) => (
          <LpReveal key={title} delay={i * 0.08}>
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconWrap}`}>
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className={`mt-6 font-sans text-2xl font-bold tracking-[-0.03em] ${accent}`}>{title}</p>
            <p className="mt-2 text-muted-foreground">{lead}</p>
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-foreground">
                  {item}
                </li>
              ))}
            </ul>
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
