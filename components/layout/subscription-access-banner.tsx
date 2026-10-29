import Link from "next/link";

import type { SubscriptionAccess } from "@/lib/subscriptions/access";

type Props = {
  access: SubscriptionAccess | null;
  activeStudentCount: number | null;
  trialEndsAt: string | null;
};

export function SubscriptionAccessBanner({ access, activeStudentCount, trialEndsAt }: Props) {
  if (access?.reason === "disabled") return null;
  const limit = access?.activeStudentLimit;
  const nearCapacity = limit != null && activeStudentCount != null && activeStudentCount >= Math.ceil(limit * 0.8);
  if (access?.canWrite && access.reason !== "trialing" && !nearCapacity) return null;

  const title = !access
    ? "Não foi possível verificar a assinatura."
    : !access.canWrite
      ? "Sua academia está em somente leitura."
      : nearCapacity
        ? "Sua academia está perto do limite de alunos ativos."
        : "Seu período de avaliação está em andamento.";
  const trialDate = trialEndsAt && Number.isFinite(Date.parse(trialEndsAt))
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(trialEndsAt))
    : null;

  return (
    <aside aria-label="Situação da assinatura" className="mb-6 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-4 text-sm text-foreground sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-muted-foreground">
          {!access ? "Tente novamente em alguns instantes. As alterações ficam protegidas até a verificação."
            : !access.canWrite ? "Você pode consultar seus dados e históricos. Gerencie a assinatura para voltar a fazer alterações."
              : nearCapacity ? `${activeStudentCount} de ${limit} vagas ativas utilizadas. Alunos inativos e arquivados permanecem no histórico.`
                : trialDate ? `A primeira cobrança está prevista para ${trialDate}. Confira o valor e gerencie seu plano em Conta.`
                  : "Confira a data da primeira cobrança e gerencie seu plano em Conta."}
        </p>
      </div>
      <Link href="/conta/assinatura" className="mt-3 inline-flex shrink-0 rounded-full bg-brand-blue px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:mt-0">
        Gerenciar assinatura
      </Link>
    </aside>
  );
}
