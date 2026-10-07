import { Award, LayoutDashboard, Users, Wallet } from "lucide-react";

import {
  LpDisplay,
  LpEyebrow,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const modules = [
  {
    number: "01",
    title: "Alunos",
    icon: Users,
    body: "Lista e ficha completa. Tipo adulto ou kids, contato, status, observações. Cada aluno carrega faixa atual, grau, histórico e a situação financeira do mês.",
  },
  {
    number: "02",
    title: "Graduação",
    icon: Award,
    body: "Promoção de grau ou faixa com data e histórico. Se houver pulo de ordem, o sistema pede justificativa antes de concluir.",
  },
  {
    number: "03",
    title: "Mensalidades",
    icon: Wallet,
    body: "Preço efetivo e dia de vencimento por aluno. Status explícito. Você confirma o pagamento quando ele acontece na vida real.",
  },
  {
    number: "04",
    title: "Painel",
    icon: LayoutDashboard,
    body: "Alunos ativos, mensalidades em atraso, aniversariantes do mês, distribuição por faixa. Atalhos para agir no mesmo dia.",
  },
] as const;

// ---------------------------------------------------------------------------
// LpProductFlow
// ---------------------------------------------------------------------------

export function LpProductFlow() {
  return (
    <LpSection id="funcionalidades">
      {/* Header */}
      <LpReveal>
        <LpEyebrow>O sistema</LpEyebrow>
        <LpDisplay className="mt-6 text-[clamp(2.25rem,5.5vw,4.5rem)]">
          O que você faz
          <br />
          dentro do Casca
        </LpDisplay>
        <p className="mt-6 max-w-[52ch] text-white/60 leading-relaxed">
          Cadastro de alunos adulto e kids, ficha com faixa e grau, histórico de graduação, planos
          Kids 1, Kids 2 e Adulto, mensalidade do mês e o painel do dia.
        </p>
      </LpReveal>

      {/* Module cards */}
      <div className="mt-16 grid gap-5 sm:grid-cols-2">
        {modules.map((mod, i) => (
          <LpReveal key={mod.number} delay={i * 0.08}>
            <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80">
                  <mod.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-sans text-sm font-semibold tabular-nums tracking-[-0.02em] text-bjj-red">
                  {mod.number}
                </span>
              </div>
              <LpDisplay className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)]">{mod.title}</LpDisplay>
              <p className="mt-3 max-w-[46ch] text-white/65 leading-relaxed">{mod.body}</p>
            </div>
          </LpReveal>
        ))}
      </div>
    </LpSection>
  );
}
