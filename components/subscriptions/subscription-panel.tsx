"use client";

import { useState, useTransition } from "react";
import { CreditCard, Loader2 } from "lucide-react";

import { cancelSubscriptionRenewal, startSubscriptionCheckout, startSubscriptionPlanChange } from "@/actions/subscription";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS, getSubscriptionPlan, type SubscriptionPlanId } from "@/lib/subscriptions/catalog";
import type { SubscriptionRecord } from "@/lib/subscriptions/types";

const STATUS_LABELS = { pending: "Adesão pendente", trialing: "Em avaliação", active: "Assinatura ativa", past_due: "Pagamento pendente", cancelled: "Renovação cancelada" };
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(cents / 100);

export function SubscriptionPanel({ subscription, activeStudentCount, configured, unavailable, checkoutReceived }: {
  subscription: SubscriptionRecord | null;
  activeStudentCount: number;
  configured: boolean;
  unavailable: boolean;
  checkoutReceived?: boolean;
}) {
  const [selected, setSelected] = useState<SubscriptionPlanId>(subscription?.plan_id ?? "essencial");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(checkoutReceived ? "Recebemos sua autorização. O acesso só é liberado depois da confirmação do pagamento." : null);
  const [pending, startTransition] = useTransition();
  const plan = subscription ? getSubscriptionPlan(subscription.plan_id) : null;
  const exempt = subscription?.kind === "exempt" || subscription?.kind === "internal_test";
  const paidThrough = subscription?.paid_until ? dateLabel(subscription.paid_until) : null;
  const trialThrough = subscription?.trial_ends_at ? dateLabel(subscription.trial_ends_at) : null;
  const inPaidPeriod = Boolean(subscription?.paid_until && Date.parse(subscription.paid_until) > Date.now());
  const canContract = !exempt && subscription && !["active", "trialing"].includes(subscription.status) && !inPaidPeriod;
  const canManage = !exempt && subscription && (["active", "trialing"].includes(subscription.status) || inPaidPeriod);
  const canCancel = canManage && subscription.status !== "cancelled";
  const selectedPlan = getSubscriptionPlan(selected);
  const changingPlan = canManage && selected !== subscription?.plan_id;

  function run(task: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try { await task(); }
      catch { setError("Não foi possível atualizar sua assinatura. Tente novamente."); }
    });
  }

  function contract() {
    run(async () => {
      const result = await startSubscriptionCheckout({ planId: selected });
      if (!result.ok) { setError(result.error); return; }
      if ("checkoutUrl" in result.data) window.location.assign(result.data.checkoutUrl);
    });
  }

  function changePlan() {
    run(async () => {
      const result = await startSubscriptionPlanChange({ planId: selected });
      if (!result.ok) { setError(result.error); return; }
      if ("checkoutUrl" in result.data) {
        window.location.assign(result.data.checkoutUrl);
        return;
      }
      if ("scheduled" in result.data) {
        setMessage(`A redução de plano entra em vigor em ${dateLabel(result.data.appliesAt)}. Até lá, o limite atual permanece e novas ativações respeitam o plano de destino.`);
        return;
      }
      setMessage("Plano atualizado. A próxima cobrança recorrente usará o novo valor.");
    });
  }

  function cancelRenewal() {
    if (!window.confirm("Cancelar a renovação? Você continua com acesso até o fim do período já pago ou da avaliação, sem nova cobrança automática.")) return;
    run(async () => {
      const result = await cancelSubscriptionRenewal();
      if (!result.ok) { setError(result.error); return; }
      setMessage("Renovação cancelada. O acesso permanece até o fim do período vigente.");
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby="subscription-status-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">Conta da academia</p>
            <h2 id="subscription-status-title" className="mt-1 text-xl font-semibold">{exempt ? (subscription.kind === "internal_test" ? "Academia de teste interno" : "Academia isenta") : subscription ? STATUS_LABELS[subscription.status] : "Assinatura em preparação"}</h2>
          </div>
          {plan ? <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{plan.name}</span> : null}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{exempt ? "Esta academia tem acesso sem cobrança de assinatura." : "A assinatura do Casca é separada das mensalidades dos seus alunos."}</p>
        {plan ? <p className="mt-3 text-sm"><strong>{activeStudentCount}</strong> de {plan.activeStudentLimit} alunos ativos no plano.</p> : null}
        {!exempt && subscription?.status === "trialing" && trialThrough ? <p className="mt-3 text-sm" role="status">Sua avaliação termina em <strong>{trialThrough}</strong>. A primeira cobrança será de {money(plan?.priceCents ?? 0)}.</p> : null}
        {!exempt && subscription?.status === "past_due" ? <p className="mt-3 text-sm" role="status">A cobrança não foi confirmada. O acesso permanece em consulta até a regularização. As tentativas automáticas continuam no cartão cadastrado.</p> : null}
        {!exempt && paidThrough ? <p className="mt-2 text-sm">{subscription?.status === "cancelled" ? "Acesso mantido até" : "Período pago até"} <strong>{paidThrough}</strong>.</p> : null}
        {subscription?.pending_plan_id ? <p className="mt-2 text-sm">Próximo plano: {getSubscriptionPlan(subscription.pending_plan_id)?.name}, em {subscription.pending_plan_at ? dateLabel(subscription.pending_plan_at) : "seu próximo vencimento"}.</p> : null}
        {message ? <p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm" role="status">{message}</p> : null}
        {unavailable || !configured ? <p className="mt-4 rounded-xl bg-muted p-3 text-sm" role="status">A contratação está sendo preparada. Nenhuma cobrança será iniciada por esta página enquanto a integração não estiver disponível.</p> : null}
      </section>

      {canContract ? <section aria-labelledby="choose-plan-title" className="space-y-4">
        <h2 id="choose-plan-title" className="text-lg font-semibold">Escolha o plano da academia</h2>
        <PlanPicker selected={selected} onChange={setSelected} disabled={pending} />
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm">{subscription.trial_used ? "A avaliação gratuita já foi utilizada. A contratação inicia com o pagamento da mensalidade." : "Experimente por 3 dias com cartão na adesão. A primeira cobrança acontece automaticamente ao final da avaliação, pelo valor mensal do plano escolhido."}</p>
          <p className="mt-2 text-sm text-muted-foreground">Você verá as condições no checkout seguro do AbacatePay e poderá cancelar a renovação pelo Casca.</p>
          {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
          <Button className="mt-4 min-h-11" disabled={pending || !configured || unavailable} onClick={contract}>{pending ? <Loader2 className="animate-spin" /> : <CreditCard />}{pending ? "Preparando contratação…" : subscription.trial_used ? "Contratar plano" : "Iniciar avaliação de 3 dias"}</Button>
        </div>
      </section> : null}

      {canManage ? <section aria-labelledby="manage-plan-title" className="space-y-4">
        <h2 id="manage-plan-title" className="text-lg font-semibold">Trocar ou cancelar</h2>
        <PlanPicker selected={selected} onChange={setSelected} disabled={pending} />
        <div className="rounded-2xl border border-border bg-card p-5">
          {changingPlan && selectedPlan ? (
            <p className="text-sm">
              {selectedPlan.priceCents > (plan?.priceCents ?? 0)
                ? `O aumento para ${selectedPlan.name} cobra agora a diferença proporcional restante do ciclo e libera o limite de ${selectedPlan.activeStudentLimit} alunos ativos depois do pagamento confirmado. A próxima mensalidade passa a ser ${money(selectedPlan.priceCents)}.`
                : `A redução para ${selectedPlan.name} entra no próximo vencimento, se os ${activeStudentCount} alunos ativos couberem no limite de ${selectedPlan.activeStudentLimit}. Até lá, novas ativações respeitam esse limite.`}
            </p>
          ) : <p className="text-sm text-muted-foreground">Selecione outro plano para ver o valor da troca. O cancelamento interrompe a renovação e preserva o período já pago.</p>}
          {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="min-h-11" disabled={pending || !configured || unavailable || !changingPlan} onClick={changePlan}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              {selectedPlan && selectedPlan.priceCents > (plan?.priceCents ?? 0) ? "Pagar diferença e aumentar plano" : "Agendar redução de plano"}
            </Button>
            {canCancel ? <Button type="button" variant="outline" className="min-h-11" disabled={pending || !configured || unavailable} onClick={cancelRenewal}>Cancelar renovação</Button> : null}
          </div>
        </div>
      </section> : null}
      <p className="text-xs text-muted-foreground">Alunos inativos permanecem no histórico e não consomem o limite de alunos ativos.</p>
    </div>
  );
}

function PlanPicker({ selected, onChange, disabled }: { selected: SubscriptionPlanId; onChange: (id: SubscriptionPlanId) => void; disabled: boolean }) {
  return (
    <fieldset className="grid gap-3 md:grid-cols-3" disabled={disabled}>
      <legend className="sr-only">Planos mensais do Casca</legend>
      {SUBSCRIPTION_PLANS.map((option) => (
        <label key={option.id} className={`cursor-pointer rounded-2xl border bg-card p-5 ${selected === option.id ? "border-primary ring-1 ring-primary" : "border-border"}`}>
          <div className="flex items-center gap-2">
            <input type="radio" name="subscription-plan" value={option.id} checked={selected === option.id} onChange={() => onChange(option.id)} className="size-4 accent-[hsl(var(--primary))]" />
            <span className="font-semibold">{option.name}</span>
          </div>
          <p className="mt-4 text-2xl font-bold">{money(option.priceCents)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
          <p className="mt-2 text-sm text-muted-foreground">Até {option.activeStudentLimit} alunos ativos. Todos os recursos atuais.</p>
        </label>
      ))}
    </fieldset>
  );
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}
