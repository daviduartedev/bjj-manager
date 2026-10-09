import { Check, GraduationCap, Store, UserRound } from "lucide-react";
import Image from "next/image";

import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const audiences = [
  {
    icon: Store,
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
    <LpSection id="para-quem" className="relative z-10 overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[460px] w-[460px] rounded-full bg-[#BF1E27]/20 blur-[130px]"
      />
      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <LpReveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bjj-red">Para quem é</p>
          <LpDisplay className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
            Cada pessoa da escola
            <br />
            vê o que precisa
          </LpDisplay>
        </LpReveal>

        {/* Logo da cobra: arquivo 1024×1024 servido sem recompressão (nítido em telas Full HD/retina). */}
        <LpReveal delay={0.1} className="mx-auto lg:mx-0">
          <Image
            src="/Logo.png"
            alt="Casca — cobra, símbolo da academia"
            width={1024}
            height={1024}
            unoptimized
            className="h-64 w-64 select-none object-contain [mask-image:radial-gradient(circle,black_64%,transparent_71%)] sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]"
            data-testid="landing-snake-logo"
          />
        </LpReveal>
      </div>

      <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
        {audiences.map(({ icon: Icon, title, lead, items }, i) => (
          <LpReveal key={title} delay={i * 0.1} className="h-full">
            <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 transition-colors duration-300 hover:border-white/25">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                <Icon className="h-5 w-5 text-white" aria-hidden />
              </span>
              <p className="mt-6 font-sans text-2xl font-semibold tracking-[-0.02em]">{title}</p>
              <p className="mt-2 text-white/60">{lead}</p>
              <ul className="mt-8 space-y-3 border-t border-white/10 pt-6">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-bjj-red" strokeWidth={3} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </LpReveal>
        ))}
      </div>
    </LpSection>
  );
}
