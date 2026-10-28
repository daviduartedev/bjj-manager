import { Check } from "lucide-react";

import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpDisplay, LpEyebrow, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-24px_rgba(0,0,0,0.18)]";

const BELT_FILL = {
  Branca: "#f1f1ee",
  Azul: "#1d4ed8",
  Roxa: "#7e22ce",
  Marrom: "#78350f",
  Preta: "#16181d",
} as const;

/** Ponteira da faixa preta. Cor real de faixa, distinta da marca. */
const BELT_TIP_RED = "#C8102E";

function Belt({ belt, degrees = 0 }: { belt: keyof typeof BELT_FILL; degrees?: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-block h-5 w-36 shrink-0 overflow-hidden rounded-[7px] border border-black/25"
      style={{ backgroundColor: BELT_FILL[belt] }}
    >
      <span
        className="absolute bottom-0 right-3 top-0 flex w-12 items-center justify-end gap-[3px] pr-1.5"
        style={{ backgroundColor: belt === "Preta" ? BELT_TIP_RED : "#0b0b0d" }}
      >
        {Array.from({ length: degrees }).map((_, i) => (
          <span key={i} className="h-3.5 w-[3px] bg-white" />
        ))}
      </span>
    </span>
  );
}

const points = [
  "Histórico com data a cada grau e a cada faixa",
  "Pulo de ordem pede justificativa antes de concluir",
  "Alerta de prontidão quando o aluno atinge o critério da academia",
  "Adulto, Kids 1 e Kids 2 no mesmo cadastro",
] as const;

const history = [
  { belt: "Roxa", degrees: 0, title: "Faixa roxa", meta: "08/10/2026 · avaliação técnica aprovada" },
  { belt: "Azul", degrees: 4, title: "Grau 4 · Faixa azul", meta: "12/03/2026 · Prof. Marcos" },
  { belt: "Azul", degrees: 3, title: "Grau 3 · Faixa azul", meta: "21/11/2025 · Prof. Marcos" },
  { belt: "Azul", degrees: 2, title: "Grau 2 · Faixa azul", meta: "09/06/2025 · Prof. Marcos" },
] as const;

export function LpBelts() {
  return (
    <LpSection id="faixas" className="bg-background">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <LpReveal>
          <LpEyebrow tone="green">Faixas e graus</LpEyebrow>
          <LpDisplay surface="light" className="mt-4 text-balance text-[clamp(2.15rem,4.2vw,3.5rem)]">
            A trajetória do aluno, registrada <span className="text-brand-green">de verdade</span>
          </LpDisplay>
          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            Cada promoção fica no histórico, com data e quem aprovou. Nada de lembrar de cabeça quando o
            aluno completou o último grau.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-base leading-snug text-foreground">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <LpPillCta
            align="start"
            strong="Histórico com data"
            note="a cada grau e a cada faixa."
            className="mt-10"
          >
            Organizar as faixas
          </LpPillCta>
        </LpReveal>

        <LpReveal delay={0.1}>
          <div
            className={`relative rounded-3xl border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_22px_48px_-18px_rgba(0,0,0,0.22)] sm:p-8 ${CARD_SHADOW}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Ficha de graduação</p>
                <p className="font-sans text-2xl font-semibold tracking-[-0.03em] text-foreground">Marina Alves</p>
              </div>
              <span className="shrink-0 rounded-full bg-[hsl(var(--status-paid)/0.12)] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--status-paid-foreground))]">
                Promoção registrada
              </span>
            </div>
            <ol className="mt-8">
              {history.map((item, index) => {
                const isLast = index === history.length - 1;
                return (
                  <li key={item.title} className="flex gap-4">
                    <div className="flex w-3 shrink-0 flex-col items-center">
                      <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary ring-4 ring-card" />
                      {isLast ? null : <span aria-hidden className="mt-1 w-px flex-1 bg-border" />}
                    </div>
                    <div
                      className={`flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 ${isLast ? "" : "pb-6"}`}
                    >
                      <Belt belt={item.belt} degrees={item.degrees} />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.meta}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </LpReveal>
      </div>
    </LpSection>
  );
}
