import { Check } from "lucide-react";

import { LpDisplay, LpReveal, LpSection } from "@/components/marketing/lp-primitives";

const BELT_FILL = {
  Branca: "#f1f1ee",
  Azul: "#1d4ed8",
  Roxa: "#7e22ce",
  Marrom: "#78350f",
  Preta: "#16181d",
} as const;

function Belt({ belt, degrees = 0 }: { belt: keyof typeof BELT_FILL; degrees?: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-block h-5 w-36 shrink-0 overflow-hidden rounded-[7px] border border-black/25"
      style={{ backgroundColor: BELT_FILL[belt] }}
    >
      <span
        className="absolute bottom-0 right-3 top-0 flex w-12 items-center justify-end gap-[3px] pr-1.5"
        style={{ backgroundColor: belt === "Preta" ? "#BF1E27" : "#0b0b0d" }}
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
    <LpSection id="faixas" className="relative z-10 overflow-hidden bg-white text-neutral-950">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
        <LpReveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bjj-red">
            Faixas e graus
          </p>
          <LpDisplay surface="light" className="mt-4 text-[clamp(2.25rem,5vw,4rem)]">
            A trajetória do aluno, registrada de verdade
          </LpDisplay>
          <p className="mt-6 max-w-[48ch] leading-relaxed text-black/60">
            Cada promoção fica no histórico, com data e quem aprovou. Nada de lembrar de cabeça quando o
            aluno completou o último grau.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-black/75">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bjj-red/10 text-bjj-red">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </LpReveal>

        <LpReveal delay={0.1}>
          <div className="relative rounded-[28px] border border-black/10 bg-neutral-50 p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.45)]">
            <div className="rounded-3xl bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-black/50">Ficha de graduação</p>
                  <p className="font-sans text-2xl font-semibold tracking-[-0.02em]">Marina Alves</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Promoção registrada
                </span>
              </div>
              <ol className="relative mt-8 space-y-6 border-l border-black/10 pl-6">
                {history.map((item) => (
                  <li key={item.title} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-bjj-red shadow"
                    />
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <Belt belt={item.belt} degrees={item.degrees} />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-black/50">{item.meta}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </LpReveal>
      </div>
    </LpSection>
  );
}
