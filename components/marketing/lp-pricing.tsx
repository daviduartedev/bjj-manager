import { ArrowRight, Check, CreditCard } from "lucide-react";
import Link from "next/link";

import { LpMark, LpReveal, LpSection } from "@/components/marketing/lp-primitives";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/catalog";
import { cn } from "@/lib/utils";

const INCLUDED = [
  "Cadastro e histórico dos alunos",
  "Aulas, presenças e graduações",
  "Controle de mensalidades e documentos",
  "Portal do aluno opcional",
] as const;

function contactUrl(): string | null {
  const configured = process.env.CASCA_CONTACT_URL?.trim();
  if (!configured || /[\r\n]/.test(configured)) return null;
  try {
    const url = new URL(configured);
    return ["https:", "mailto:"].includes(url.protocol) && !url.username && !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function LpPricing() {
  const consultationUrl = contactUrl();

  return (
    <LpSection id="planos" className="scroll-mt-16 bg-white">
      <LpReveal direction="left" duration={1.05}>
        <h2 className="max-w-3xl text-balance font-sans text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.035em]">
          Escolha pelo número de alunos. <LpMark>O resto já vem junto</LpMark>.
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
          Todos os recursos atuais estão em todos os planos. O que muda é a quantidade de alunos ativos que
          a sua academia acompanha.
        </p>
      </LpReveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan, index) => {
          const recommended = plan.id === "academia";
          const price = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          }).format(plan.priceCents / 100);

          return (
            <LpReveal
              key={plan.id}
              direction={index === 1 ? "scale" : index === 0 ? "left" : "right"}
              delay={index * 0.08}
              duration={1.05}
            >
            <article
              className={cn(
                "ease-lp-expo relative flex min-w-0 flex-col rounded-3xl border bg-[#f4f6f8] p-6 transition-transform duration-300 hover:-translate-y-2 sm:p-8",
                recommended ? "border-brand-green ring-1 ring-brand-green" : "border-black/[0.08]",
              )}
            >
              {recommended ? (
                <p className="mb-5 w-fit rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white">
                  O mais escolhido
                </p>
              ) : null}
              <h3 className={cn("text-xl font-semibold", !recommended && "lg:mt-12")}>{plan.name}</h3>
              <p className="mt-6 flex flex-wrap items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight">{price}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </p>
              <p className="mt-3 font-medium">Até {plan.activeStudentLimit} alunos ativos</p>
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
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3 text-center text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  recommended
                    ? "bg-brand-green text-white hover:bg-brand-green/90"
                    : "bg-brand-blue text-white hover:bg-brand-blue/90",
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
      <div className="flex flex-col gap-4 rounded-2xl bg-[#f4f6f8] p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <CreditCard className="mt-1 size-4 shrink-0 text-brand-blue" aria-hidden />
          A mensalidade é cobrada quando a adesão é confirmada. Alunos inativos não ocupam vagas do plano.
        </p>
        <div className="shrink-0 text-sm">
          <p className="font-medium">Mais de 300 alunos? Capacidade sob consulta.</p>
          {consultationUrl ? (
            <a
              href={consultationUrl}
              className="mt-1 inline-flex min-h-11 items-center font-semibold text-brand-blue underline underline-offset-4"
            >
              Consultar capacidade
            </a>
          ) : null}
        </div>
      </div>
      </LpReveal>
    </LpSection>
  );
}
