import { ArrowRight, Check, CreditCard } from "lucide-react";
import Link from "next/link";

import { LpMark, LpReveal, LpSection } from "@/components/marketing/lp-primitives";
import { LP_PRIMARY_CTA } from "@/components/marketing/lp-cta-styles";
import { SUBSCRIPTION_PLANS, hasStudentLimit, type SubscriptionPlan } from "@/lib/subscriptions/catalog";
import { cn } from "@/lib/utils";

/** Só o que o Casca já entrega. Recurso novo entra aqui quando estiver no produto. */
const INCLUDED = [
  "Controle completo de alunos",
  "Turmas, aulas e frequência com check-in",
  "Gestão de graduações",
  "Mensalidades e controle financeiro",
  "Portal do aluno",
  "Planos de aula",
  "Matrícula e termos com assinatura digital",
  "Documentos e recibos",
  "Lembretes de cobrança pelo WhatsApp",
  "Loja virtual para venda de produtos",
] as const;

const RECOMMENDED_PLAN_ID = "academia_100";

const priceFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function capacityLabel(plan: SubscriptionPlan): string {
  return hasStudentLimit(plan) ? `Até ${plan.activeStudentLimit} alunos ativos` : "Alunos ativos ilimitados";
}

export function LpPricing() {
  return (
    <LpSection id="planos" className="scroll-mt-16 bg-white">
      <LpReveal direction="left" duration={1.05}>
        <h2 className="max-w-3xl text-balance font-sans text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em]">
          Um plano para o tamanho da <LpMark>sua academia.</LpMark>
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
          Começando agora ou com a turma crescendo? Todos os planos incluem os recursos atuais do Casca.
          Você escolhe pela quantidade de alunos ativos.
        </p>
      </LpReveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan, index) => {
          const recommended = plan.id === RECOMMENDED_PLAN_ID;
          const price = priceFormat.format(plan.priceCents / 100);

          return (
            <LpReveal
              key={plan.id}
              direction={index === 1 ? "scale" : index === 0 ? "left" : "right"}
              delay={index * 0.08}
              duration={1.05}
            >
            <article
              className={cn(
                "relative flex h-full min-w-0 flex-col rounded-2xl border bg-white p-6 sm:p-8",
                recommended ? "border-brand-green ring-1 ring-brand-green" : "border-black/[0.08]",
              )}
            >
              {recommended ? (
                <p className="mb-5 w-fit rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white">
                  Recomendado
                </p>
              ) : null}
              <h3 className={cn("text-xl font-semibold", !recommended && "lg:mt-12")}>{plan.name}</h3>
              <p className="mt-6 flex flex-wrap items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight">{price}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </p>
              <p className="mt-3 font-medium">{capacityLabel(plan)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Uma academia por assinatura.</p>
              <ul className="my-7 flex-1 space-y-3 text-sm">
                {INCLUDED.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-green" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/register?plano=${plan.id}`}
                className={cn(
                  LP_PRIMARY_CTA,
                  "gap-2 px-5",
                )}
              >
                Escolher {plan.name}
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Cobrança mensal iniciada na adesão. Cancele quando quiser.
              </p>
            </article>
            </LpReveal>
          );
        })}
      </div>

      <LpReveal direction="up" className="mt-7">
      <div className="bg-white py-5">
        <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <CreditCard className="mt-1 size-4 shrink-0 text-brand-blue" aria-hidden />
          A mensalidade é cobrada quando a adesão é confirmada. Alunos inativos não ocupam vagas do plano.
        </p>
      </div>
      </LpReveal>
    </LpSection>
  );
}
