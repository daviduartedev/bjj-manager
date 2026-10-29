import { AlertTriangle, ArrowUpRight, Cake, Check, Users } from "lucide-react";
import type { ReactNode } from "react";

import { LpPillCta } from "@/components/marketing/lp-chrome";
import { LpHighlightLines } from "@/components/marketing/lp-highlight-lines";
import {
  LpDisplay,
  LpMark,
  LpReveal,
  LpSection,
} from "@/components/marketing/lp-primitives";

// ---------------------------------------------------------------------------
// Mini-telas do sistema (decorativas)
// ---------------------------------------------------------------------------

const BELT = {
  Branca: "#f1f1ee",
  Azul: "#1d4ed8",
  Roxa: "#7e22ce",
  Marrom: "#78350f",
  Preta: "#16181d",
} as const;

function BeltChip({ belt, degrees = 0 }: { belt: keyof typeof BELT; degrees?: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-block h-3 w-16 shrink-0 overflow-hidden rounded-[4px] border border-black/20"
      style={{ backgroundColor: BELT[belt] }}
    >
      <span
        className="absolute bottom-0 right-1.5 top-0 flex w-6 items-center justify-end gap-[2px] pr-1"
        style={{ backgroundColor: belt === "Preta" ? "#C8102E" : "#0b0b0d" }}
      >
        {Array.from({ length: degrees }).map((_, i) => (
          <span key={i} className="h-2 w-[2px] bg-white" />
        ))}
      </span>
    </span>
  );
}

function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-22px_rgba(0,0,0,0.25)] sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

const students = [
  { initials: "MA", name: "Marina Alves", plan: "Adulto", belt: "Roxa", degrees: 0 },
  { initials: "PL", name: "Pedro Lima", plan: "Kids 2", belt: "Azul", degrees: 3 },
  { initials: "JS", name: "Julia Santos", plan: "Kids 1", belt: "Branca", degrees: 2 },
] as const;

function StudentsScreen() {
  return (
    <Screen>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Alunos</p>
        <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-[11px] font-semibold text-brand-blue">
          Adulto e kids
        </span>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {students.map((s) => (
          <li key={s.name} className="flex items-center gap-3 py-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
              {s.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.plan}</p>
            </div>
            <BeltChip belt={s.belt} degrees={s.degrees} />
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function GraduationScreen() {
  return (
    <Screen>
      <p className="text-xs text-muted-foreground">Pedro Lima · Faixa azul</p>
      <div className="mt-3 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < 3 ? "bg-brand-green" : "bg-brand-green/15"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-foreground">Grau 3 de 4</p>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[hsl(var(--status-pending)/0.14)] px-3 py-2.5 text-xs leading-snug text-[hsl(var(--status-pending-foreground))]">
        <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
        Pulo de ordem pede justificativa
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-green px-3.5 py-2 text-xs font-semibold text-white">
        Promover grau
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Screen>
  );
}

const fees = [
  { name: "Marina Alves", due: "Vence dia 05", status: "Em dia", tone: "paid" },
  { name: "Pedro Lima", due: "Vence dia 10", status: "Pendente", tone: "pending" },
  { name: "Julia Santos", due: "Venceu dia 01", status: "Atrasada", tone: "overdue" },
] as const;

function FeesScreen() {
  return (
    <Screen>
      <p className="text-sm font-semibold text-foreground">Mensalidades do mês</p>
      <ul className="mt-3 space-y-2">
        {fees.map((f) => (
          <li key={f.name} className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{f.name}</p>
              <p className="text-[11px] text-muted-foreground">{f.due}</p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: `hsl(var(--status-${f.tone}) / 0.14)`,
                color: `hsl(var(--status-${f.tone}-foreground))`,
              }}
            >
              {f.status}
            </span>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

const distribution = [
  { belt: "Branca", value: 18 },
  { belt: "Azul", value: 14 },
  { belt: "Roxa", value: 8 },
  { belt: "Marrom", value: 5 },
  { belt: "Preta", value: 3 },
] as const;

function DashboardScreen() {
  const max = Math.max(...distribution.map((d) => d.value));
  return (
    <Screen>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl bg-neutral-950 p-3 text-white">
          <Users className="h-4 w-4 opacity-70" aria-hidden />
          <p className="mt-2 text-xl font-bold tracking-[-0.03em]">48</p>
          <p className="text-[11px] opacity-70">Ativos</p>
        </div>
        <div className="rounded-xl bg-[hsl(var(--status-overdue)/0.1)] p-3 text-[hsl(var(--status-overdue-foreground))]">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          <p className="mt-2 text-xl font-bold tracking-[-0.03em]">3</p>
          <p className="text-[11px]">Em atraso</p>
        </div>
        <div className="rounded-xl bg-[hsl(var(--status-pending)/0.16)] p-3 text-[hsl(var(--status-pending-foreground))]">
          <Cake className="h-4 w-4" aria-hidden />
          <p className="mt-2 text-xl font-bold tracking-[-0.03em]">2</p>
          <p className="text-[11px]">Aniversários</p>
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-foreground">Distribuição por faixa</p>
      <div className="mt-2 flex h-20 items-end gap-2">
        {distribution.map((d) => (
          <div key={d.belt} className="flex h-full flex-1 flex-col justify-end">
            <span
              className="w-full rounded-t-md border border-black/15"
              style={{ height: `${(d.value / max) * 100}%`, backgroundColor: BELT[d.belt] }}
            />
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const modules = [
  {
    title: "Alunos",
    tag: "Cadastro",
    tagClass: "bg-brand-blue text-white",
    stage: "bg-brand-blue/[0.07]",
    body: "Lista e ficha completa. Tipo adulto ou kids, contato, status, observações. Cada aluno carrega faixa atual, grau, histórico e a situação financeira do mês.",
    screen: <StudentsScreen />,
  },
  {
    title: "Graduação",
    tag: "Faixas e graus",
    tagClass: "bg-brand-green text-white",
    stage: "bg-brand-green/[0.07]",
    body: "Promoção de grau ou faixa com data e histórico. Se houver pulo de ordem, o sistema pede justificativa antes de concluir.",
    screen: <GraduationScreen />,
  },
  {
    title: "Mensalidades",
    tag: "Financeiro",
    tagClass: "bg-brand-yellow text-neutral-950",
    stage: "bg-brand-yellow/[0.12]",
    body: "Preço efetivo e dia de vencimento por aluno. Status explícito. Você confirma o pagamento quando ele acontece na vida real.",
    screen: <FeesScreen />,
  },
  {
    title: "Painel",
    tag: "Seu dia",
    tagClass: "bg-neutral-950 text-white",
    stage: "bg-neutral-950/[0.05]",
    body: "Alunos ativos, mensalidades em atraso, aniversariantes do mês, distribuição por faixa. Atalhos para agir no mesmo dia.",
    screen: <DashboardScreen />,
  },
] as const;

// ---------------------------------------------------------------------------
// LpProductFlow
// ---------------------------------------------------------------------------

export function LpProductFlow() {
  return (
    <LpSection id="funcionalidades" className="bg-[#f3faf6]">
      <LpReveal>
        <LpDisplay surface="light" className="text-[clamp(2.25rem,5vw,3.75rem)]">
          O que a academia
          <br />
          faz no <LpMark>Casca</LpMark>
        </LpDisplay>
        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
          Cadastro de alunos adulto e kids, ficha com faixa e grau, histórico de graduação, planos
          Kids 1, Kids 2 e Adulto, mensalidade do mês e o painel do dia.
        </p>
      </LpReveal>

      <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-28">
        {modules.map((mod, i) => (
          <LpReveal key={mod.title} delay={0.04}>
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className={`flex justify-center px-2 py-4 sm:px-6 ${mod.stage} rounded-[2rem]`}>
                <div className="w-full max-w-md">{mod.screen}</div>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${mod.tagClass}`}
                >
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  {mod.tag}
                </span>
                <p className="mt-5 font-sans text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-[-0.035em] text-foreground">
                  {mod.title}
                </p>
                <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {mod.body}
                </p>
              </div>
            </div>
          </LpReveal>
        ))}
      </div>

      <LpReveal className="mt-16 sm:mt-20">
        <LpHighlightLines
          rows={[
            { lead: "Alunos", mark: "no mesmo lugar", tone: "text-brand-blue" },
            { lead: "Faixas", mark: "no mesmo lugar", tone: "text-brand-green" },
            { lead: "Mensalidades", mark: "no mesmo lugar", tone: "text-foreground" },
          ]}
        />
      </LpReveal>

      <LpReveal className="mt-12 sm:mt-14">
        <LpPillCta tone="green" strong="Alunos, faixas e mensalidades" note="no mesmo lugar.">
          Criar minha academia
        </LpPillCta>
      </LpReveal>
    </LpSection>
  );
}
