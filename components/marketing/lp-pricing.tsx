import {
  ArrowRight,
  CalendarCheck,
  FileSignature,
  FileText,
  Infinity as InfinityIcon,
  Medal,
  MessageCircle,
  NotebookPen,
  Smartphone,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { LP_PRIMARY_CTA } from "@/components/marketing/lp-cta-styles";
import { LpMark, LpReveal, LpSection } from "@/components/marketing/lp-primitives";
import { SUBSCRIPTION_PLANS, capacityLabel, hasStudentLimit } from "@/lib/subscriptions/catalog";
import { cn } from "@/lib/utils";

/** Só o que o Casca já entrega, agrupado por assunto. Recurso novo entra aqui quando estiver no produto. */
const FEATURE_GROUPS: { title: string; items: { label: string; icon: LucideIcon }[] }[] = [
  {
    title: "Alunos e aulas",
    items: [
      { label: "Controle completo de alunos", icon: Users },
      { label: "Turmas, aulas e frequência com check-in", icon: CalendarCheck },
      { label: "Gestão de graduações", icon: Medal },
      { label: "Planos de aula", icon: NotebookPen },
    ],
  },
  {
    title: "Financeiro e vendas",
    items: [
      { label: "Mensalidades e controle financeiro", icon: Wallet },
      { label: "Lembretes de cobrança pelo WhatsApp", icon: MessageCircle },
      { label: "Loja virtual para venda de produtos", icon: Store },
    ],
  },
  {
    title: "Portal e documentos",
    items: [
      { label: "Portal do aluno", icon: Smartphone },
      { label: "Matrícula e termos com assinatura digital", icon: FileSignature },
      { label: "Documentos e recibos", icon: FileText },
    ],
  },
];

const RECOMMENDED_PLAN_ID = "academia_100";

/** Cada plano e cada grupo de recursos herda uma cor da tarja verde, amarela e azul. */
const TONE = ["hsl(var(--brand-green))", "hsl(var(--brand-yellow))", "hsl(var(--brand-blue))"];
/** Mesmas cores para texto e ícone sobre branco; o amarelo escurece para manter contraste. */
const TONE_TEXT = ["hsl(var(--brand-green))", "hsl(45 100% 34%)", "hsl(var(--brand-blue))"];

const priceFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function PlanPrice({ priceCents }: { priceCents: number }) {
  const full = priceFormat.format(priceCents / 100);
  const [whole, cents] = full.replace("R$", "").trim().split(",");
  return (
    <p className="relative mt-8 flex items-start font-bold tabular-nums tracking-[-0.05em]">
      <span className="sr-only">{full} por mês</span>
      <span aria-hidden className="mt-2 text-lg font-semibold tracking-normal text-muted-foreground">R$</span>
      <span aria-hidden className="ml-1.5 text-6xl leading-none">{whole}</span>
      <span aria-hidden className="mt-1 text-2xl leading-none">,{cents}</span>
      <span aria-hidden className="ml-1.5 self-end pb-1 text-sm font-medium tracking-normal text-muted-foreground">/mês</span>
    </p>
  );
}

export function LpPricing() {
  return (
    <LpSection id="planos" className="scroll-mt-16 bg-white">
      <LpReveal direction="left" duration={1.05}>
        <h2 className="max-w-3xl text-balance font-sans text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em]">
          Um plano para o tamanho da <LpMark>sua academia.</LpMark>
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
          Todos os planos têm os mesmos recursos. Você escolhe só pela quantidade de alunos ativos.
        </p>
      </LpReveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan, index) => {
          const recommended = plan.id === RECOMMENDED_PLAN_ID;
          return (
            <LpReveal
              key={plan.id}
              direction={index === 1 ? "scale" : index === 0 ? "left" : "right"}
              delay={index * 0.08}
              duration={1.05}
            >
              {/* Borda de 1 px: tricolor no recomendado, cinza nos demais. */}
              <div
                className={cn("h-full rounded-3xl p-px", recommended && "shadow-[0_24px_48px_-28px_hsl(var(--brand-green)/0.55)]")}
                style={{ background: recommended ? `linear-gradient(135deg, ${TONE[0]}, ${TONE[1]}, ${TONE[2]})` : "rgba(0,0,0,0.08)" }}
              >
                <article className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-white p-7 sm:p-8">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full opacity-[0.12] blur-2xl"
                    style={{ background: TONE[index % TONE.length] }}
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <span aria-hidden className="size-2.5 rounded-full" style={{ background: TONE[index % TONE.length] }} />
                      {plan.name}
                    </h3>
                    {recommended ? (
                      <p className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">Recomendado</p>
                    ) : null}
                  </div>
                  <PlanPrice priceCents={plan.priceCents} />
                  <p className="relative mt-6 flex items-center gap-2 font-semibold">
                    {hasStudentLimit(plan) ? <Users className="size-4" aria-hidden /> : <InfinityIcon className="size-4" aria-hidden />}
                    {capacityLabel(plan)}
                  </p>
                  <p className="relative mt-1 text-sm text-muted-foreground">Todos os recursos · uma academia por assinatura</p>
                  <div className="flex-1" />
                  <Link href={`/register?plano=${plan.id}`} className={cn(LP_PRIMARY_CTA, "relative mt-10 gap-2 px-5")}>
                    Escolher {plan.name}
                    <ArrowRight className="size-4 shrink-0" aria-hidden />
                  </Link>
                </article>
              </div>
            </LpReveal>
          );
        })}
      </div>

      <LpReveal direction="up" className="mt-20">
        <h3 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Tudo isso em qualquer plano.</h3>
        <div className="mt-12 grid gap-y-10 lg:grid-cols-[4fr_3fr_3fr] lg:gap-x-6">
          {FEATURE_GROUPS.map((group, groupIndex) => (
            <section key={group.title} aria-label={group.title} className="flex flex-col">
              {/* Nome do grupo vem primeiro para leitores de tela; na tela, fica sob a barra colorida. */}
              <p
                className="order-last mt-3 text-center text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: TONE_TEXT[groupIndex] }}
              >
                {group.title}
              </p>
              <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
                {group.items.map(({ label, icon: Icon }) => (
                  <li key={label} className="flex flex-col items-center gap-3 text-center">
                    <Icon className="size-8" strokeWidth={1.6} style={{ color: TONE_TEXT[groupIndex] }} aria-hidden />
                    <span className="max-w-[12rem] text-sm font-medium leading-snug">{label}</span>
                  </li>
                ))}
              </ul>
              <span aria-hidden className="mt-8 h-1.5 rounded-full" style={{ background: TONE[groupIndex] }} />
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted-foreground">
          Cobrança mensal iniciada na adesão. Cancele quando quiser. Alunos inativos não ocupam vagas do plano.
        </p>
      </LpReveal>
    </LpSection>
  );
}
