import { Award, LayoutDashboard, Users, Wallet } from "lucide-react";

import {
  LpDisplay,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const modules = [
  {
    title: "Alunos",
    icon: Users,
    body: "Lista e ficha completa. Tipo adulto ou kids, contato, status, observações. Cada aluno carrega faixa atual, grau, histórico e a situação financeira do mês.",
  },
  {
    title: "Graduação",
    icon: Award,
    body: "Promoção de grau ou faixa com data e histórico. Se houver pulo de ordem, o sistema pede justificativa antes de concluir.",
  },
  {
    title: "Mensalidades",
    icon: Wallet,
    body: "Preço efetivo e dia de vencimento por aluno. Status explícito. Você confirma o pagamento quando ele acontece na vida real.",
  },
  {
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
    <LpSection id="funcionalidades" className="relative z-10 bg-white text-neutral-950">
      {/* Header */}
      <LpReveal>
        <LpDisplay surface="light" className="text-[clamp(2.25rem,5.5vw,4.5rem)]">
          O que você faz
          <br />
          dentro do Casca
        </LpDisplay>
        <p className="mt-6 max-w-[52ch] text-black/60 leading-relaxed">
          Cadastro de alunos adulto e kids, ficha com faixa e grau, histórico de graduação, planos
          Kids 1, Kids 2 e Adulto, mensalidade do mês e o painel do dia.
        </p>
      </LpReveal>

      {/* Module cards */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
        {modules.map((mod, i) => (
          <LpReveal key={mod.title} delay={i * 0.08}>
            <div className="group h-full rounded-2xl border border-black/10 bg-white p-7 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.35)] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.28)] sm:p-10">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03] text-neutral-800">
                  <mod.icon className="h-5 w-5" aria-hidden />
                </span>
              <LpDisplay surface="light" className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)]">{mod.title}</LpDisplay>
              <p className="mt-3 max-w-[46ch] text-black/60 leading-relaxed">{mod.body}</p>
            </div>
          </LpReveal>
        ))}
      </div>
    </LpSection>
  );
}
