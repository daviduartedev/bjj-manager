"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Check, Clock, CreditCard, Loader2, Lock, RefreshCw } from "lucide-react";

import {
  cancelSubscriptionRenewal,
  quoteSubscriptionPlanChange,
  startSubscriptionCheckout,
  startSubscriptionPlanChange,
} from "@/actions/subscription";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS, getSubscriptionPlan, type SubscriptionPlanId } from "@/lib/subscriptions/catalog";
import type { PlanChangeQuote, SubscriptionRecord, SubscriptionStatus } from "@/lib/subscriptions/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending: "Adesão pendente",
  trialing: "Em avaliação",
  active: "Assinatura ativa",
  past_due: "Pagamento pendente",
  cancelled: "Renovação cancelada",
};

/** Verde confirma, amarelo pede atenção, azul informa. */
const STATUS_TONE: Record<SubscriptionStatus, string> = {
  pending: "bg-[#F8B800]/20 text-neutral-900",
  trialing: "bg-[#0055A0]/10 text-[#0055A0]",
  active: "bg-[#008037]/12 text-[#008037]",
  past_due: "bg-[#F8B800]/20 text-neutral-900",
  cancelled: "bg-neutral-200 text-neutral-700",
};

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(cents / 100);

const PRIMARY = "min-h-12 rounded-xl bg-[#0055A0] px-5 text-white hover:bg-[#0055A0]/90";

export function SubscriptionPanel({ subscription, activeStudentCount, configured, trialsEnabled, unavailable, checkoutReceived }: {
  subscription: SubscriptionRecord | null;
  activeStudentCount: number;
  configured: boolean;
  trialsEnabled: boolean;
  unavailable: boolean;
  checkoutReceived?: boolean;
}) {
  const [selected, setSelected] = useState<SubscriptionPlanId>(subscription?.plan_id ?? "essencial");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const plan = subscription ? getSubscriptionPlan(subscription.plan_id) : null;
  const exempt = subscription?.kind === "exempt" || subscription?.kind === "internal_test";
  const inPaidPeriod = Boolean(subscription?.paid_until && Date.parse(subscription.paid_until) > Date.now());
  const confirmed = Boolean(subscription && (["active", "trialing"].includes(subscription.status) || inPaidPeriod));
  const canContract = !exempt && subscription && !["active", "trialing"].includes(subscription.status) && !inPaidPeriod;
  const canManage = !exempt && subscription && confirmed;
  const blocked = pending || !configured || unavailable;

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
    <div className="mx-auto max-w-6xl space-y-5 pb-6">
      <StatusCard
        subscription={subscription}
        exempt={exempt}
        confirmed={confirmed}
        activeStudentCount={activeStudentCount}
        message={message}
        unavailable={unavailable || !configured}
      />

      {checkoutReceived && !exempt && subscription ? (
        <CheckoutReturn subscription={subscription} confirmed={confirmed} />
      ) : null}

      {!checkoutReceived && canContract ? (
        <section aria-labelledby="choose-plan-title" className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <h2 id="choose-plan-title" className="text-xl font-semibold tracking-[-0.02em]">Escolha o plano da academia</h2>
            <PlanPicker selected={selected} onChange={setSelected} disabled={pending} activeStudentCount={activeStudentCount} />
          </div>
          <ContractSummary
            planId={selected}
            trial={!subscription.trial_used && trialsEnabled}
            pending={pending}
            blocked={blocked}
            error={error}
            onContract={contract}
          />
        </section>
      ) : null}

      {!checkoutReceived && canManage && plan ? (
        <section aria-labelledby="manage-plan-title" className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <h2 id="manage-plan-title" className="text-xl font-semibold tracking-[-0.02em]">Trocar de plano</h2>
            <PlanPicker selected={selected} onChange={setSelected} disabled={pending} currentPlanId={plan.id} activeStudentCount={activeStudentCount} />
          </div>
          <ChangeSummary
            currentPlanId={plan.id}
            targetPlanId={selected}
            activeStudentCount={activeStudentCount}
            canQuote={configured && !unavailable}
            pending={pending}
            blocked={blocked}
            error={error}
            canCancel={subscription.status !== "cancelled"}
            onChange={changePlan}
            onCancel={cancelRenewal}
          />
        </section>
      ) : null}

      <p className="text-sm text-muted-foreground">Alunos inativos permanecem no histórico e não consomem o limite de alunos ativos.</p>
    </div>
  );
}

function StatusCard({ subscription, exempt, confirmed, activeStudentCount, message, unavailable }: {
  subscription: SubscriptionRecord | null;
  exempt: boolean;
  confirmed: boolean;
  activeStudentCount: number;
  message: string | null;
  unavailable: boolean;
}) {
  const plan = subscription ? getSubscriptionPlan(subscription.plan_id) : null;
  const paidThrough = subscription?.paid_until ? dateLabel(subscription.paid_until) : null;
  const trialThrough = subscription?.trial_ends_at ? dateLabel(subscription.trial_ends_at) : null;
  const title = exempt
    ? subscription?.kind === "internal_test" ? "Academia de teste interno" : "Academia isenta"
    : subscription ? STATUS_LABELS[subscription.status] : "Assinatura em preparação";

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:p-7" aria-labelledby="subscription-status-title">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-end">
        <div className="min-w-0">
          {subscription && !exempt && confirmed ? (
            <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-semibold", STATUS_TONE[subscription.status])}>
              {plan ? plan.name : "Plano"}
            </span>
          ) : null}
          <h2 id="subscription-status-title" className="mt-3 text-2xl first:mt-0 font-bold tracking-[-0.03em] sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            {exempt ? "Esta academia tem acesso sem cobrança de assinatura." : "A assinatura do Casca é separada das mensalidades dos seus alunos."}
          </p>
          {!exempt && subscription?.status === "trialing" && trialThrough ? (
            <p className="mt-3 text-sm" role="status">Sua avaliação termina em <strong>{trialThrough}</strong>. A primeira cobrança será de {money(plan?.priceCents ?? 0)}.</p>
          ) : null}
          {!exempt && subscription?.status === "past_due" ? (
            <p className="mt-3 text-sm" role="status">A cobrança não foi confirmada. O acesso permanece em consulta até a regularização. As tentativas automáticas continuam no cartão cadastrado.</p>
          ) : null}
          {!exempt && paidThrough ? (
            <p className="mt-3 text-sm">{subscription?.status === "cancelled" ? "Acesso mantido até" : "Período pago até"} <strong>{paidThrough}</strong>.</p>
          ) : null}
          {subscription?.pending_plan_id ? (
            <p className="mt-2 text-sm">Próximo plano: {getSubscriptionPlan(subscription.pending_plan_id)?.name}, em {subscription.pending_plan_at ? dateLabel(subscription.pending_plan_at) : "seu próximo vencimento"}.</p>
          ) : null}
        </div>
        {plan && (confirmed || exempt) ? <UsageMeter used={activeStudentCount} limit={plan.activeStudentLimit} /> : null}
      </div>
      {message ? <p className="mt-5 rounded-2xl bg-[#008037]/10 p-4 text-sm" role="status">{message}</p> : null}
      {unavailable ? (
        <p className="mt-5 rounded-2xl bg-[#F5F3F0] p-4 text-sm" role="status">
          A contratação está sendo preparada. Nenhuma cobrança será iniciada por esta página enquanto a integração não estiver disponível.
        </p>
      ) : null}
    </section>
  );
}

function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const ratio = Math.min(1, limit > 0 ? used / limit : 0);
  const near = ratio >= 0.9;
  return (
    <div>
      <p className="text-sm text-muted-foreground">Alunos ativos no plano</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-[-0.02em]">
        {used} <span className="text-base font-medium text-muted-foreground">de {limit}</span>
      </p>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#F5F3F0]"
        role="meter"
        aria-label="Alunos ativos no plano"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
      >
        <div className={cn("h-full rounded-full", near ? "bg-[#F8B800]" : "bg-[#0055A0]")} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

function PlanPicker({ selected, onChange, disabled, currentPlanId, activeStudentCount }: {
  selected: SubscriptionPlanId;
  onChange: (id: SubscriptionPlanId) => void;
  disabled: boolean;
  currentPlanId?: SubscriptionPlanId;
  activeStudentCount: number;
}) {
  return (
    <fieldset className="grid gap-3 md:grid-cols-3" disabled={disabled}>
      <legend className="sr-only">Planos mensais do Casca</legend>
      {SUBSCRIPTION_PLANS.map((option) => {
        const isSelected = selected === option.id;
        const isCurrent = currentPlanId === option.id;
        const tooSmall = activeStudentCount > option.activeStudentLimit;
        return (
          <label
            key={option.id}
            className={cn(
              "relative flex cursor-pointer flex-col rounded-2xl border-2 bg-white p-5 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0055A0] has-[:focus-visible]:ring-offset-2",
              isSelected ? "border-[#0055A0]" : "border-transparent hover:border-[#0055A0]/30",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="subscription-plan"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onChange(option.id)}
                  className="size-4 accent-[#0055A0]"
                />
                <span className="font-semibold">{option.name}</span>
              </span>
              {isCurrent ? <span className="shrink-0 whitespace-nowrap rounded-full bg-[#008037] px-2.5 py-0.5 text-xs font-semibold text-white">Plano atual</span> : null}
            </div>
            <p className="mt-5 text-3xl font-bold tabular-nums tracking-[-0.03em]">
              {money(option.priceCents)}
              <span className="ml-1 text-sm font-normal tracking-normal text-muted-foreground">/mês</span>
            </p>
            <p className="mt-2 text-sm font-medium">Até {option.activeStudentLimit} alunos ativos</p>
            <p className="mt-1 text-sm text-muted-foreground">Todos os recursos atuais.</p>
            {tooSmall ? (
              <p className="mt-3 rounded-lg bg-[#F8B800]/20 px-2.5 py-1.5 text-xs font-medium text-neutral-900">
                Você tem {activeStudentCount} alunos ativos.
              </p>
            ) : null}
          </label>
        );
      })}
    </fieldset>
  );
}

function SecureNote() {
  return (
    <p className="flex items-start gap-2 text-sm text-muted-foreground">
      <Lock className="mt-0.5 size-4 shrink-0 text-[#0055A0]" aria-hidden />
      O pagamento é feito no checkout seguro da AbacatePay. Ao concluir, você volta para esta página.
    </p>
  );
}

function ContractSummary({ planId, trial, pending, blocked, error, onContract }: {
  planId: SubscriptionPlanId;
  trial: boolean;
  pending: boolean;
  blocked: boolean;
  error: string | null;
  onContract: () => void;
}) {
  const plan = getSubscriptionPlan(planId);
  if (!plan) return null;
  return (
    <aside aria-labelledby="contract-summary-title" className="h-fit rounded-3xl bg-[#F5F3F0] p-5 sm:p-7 lg:sticky lg:top-6">
      <h3 id="contract-summary-title" className="text-lg font-semibold">Resumo da adesão</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <SummaryRow label="Plano" value={plan.name} />
        <SummaryRow label="Limite" value={`${plan.activeStudentLimit} alunos ativos`} />
        <SummaryRow label="Mensalidade" value={`${money(plan.priceCents)}/mês`} />
      </dl>
      <div className="mt-5 border-t border-black/10 pt-5">
        {trial ? (
          <p className="text-sm leading-relaxed">
            Experimente por 3 dias com cartão na adesão. A primeira cobrança acontece automaticamente ao final da avaliação, pelo valor mensal do plano escolhido.
          </p>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Cobrança na adesão</p>
            <p className="text-2xl font-bold tabular-nums tracking-[-0.02em]">{money(plan.priceCents)}</p>
          </div>
        )}
        {!trial ? <p className="mt-1 text-sm text-muted-foreground">A mensalidade começa hoje e renova todo mês no cartão. Você pode cancelar a renovação pelo Casca.</p> : null}
      </div>
      {error ? <p className="mt-4 text-sm font-medium text-destructive" role="alert">{error}</p> : null}
      <Button className={cn(PRIMARY, "mt-5 w-full")} disabled={blocked} onClick={onContract}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <CreditCard aria-hidden />}
        {pending ? "Preparando o checkout…" : trial ? "Iniciar avaliação de 3 dias" : "Continuar para o pagamento"}
      </Button>
      <div className="mt-4">
        <SecureNote />
      </div>
    </aside>
  );
}

function ChangeSummary({ currentPlanId, targetPlanId, activeStudentCount, canQuote, pending, blocked, error, canCancel, onChange, onCancel }: {
  currentPlanId: SubscriptionPlanId;
  targetPlanId: SubscriptionPlanId;
  activeStudentCount: number;
  canQuote: boolean;
  pending: boolean;
  blocked: boolean;
  error: string | null;
  canCancel: boolean;
  onChange: () => void;
  onCancel: () => void;
}) {
  const current = getSubscriptionPlan(currentPlanId);
  const target = getSubscriptionPlan(targetPlanId);
  const changing = targetPlanId !== currentPlanId;
  const quote = usePlanQuote(changing && canQuote ? targetPlanId : null);
  if (!current || !target) return null;
  const upgrade = target.priceCents > current.priceCents;
  const tooSmall = !upgrade && activeStudentCount > target.activeStudentLimit;
  const data = quote.data;

  return (
    <aside aria-labelledby="change-summary-title" className="h-fit rounded-3xl bg-[#F5F3F0] p-5 sm:p-7 lg:sticky lg:top-6">
      <h3 id="change-summary-title" className="text-lg font-semibold">Resumo da troca</h3>
      {!changing ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Selecione outro plano para ver o valor da troca. O cancelamento interrompe a renovação e preserva o período já pago.
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
            <div className="rounded-2xl bg-white p-3">
              <p className="text-muted-foreground">Atual</p>
              <p className="font-semibold">{current.name}</p>
              <p className="tabular-nums text-muted-foreground">{money(current.priceCents)}/mês</p>
            </div>
            <span aria-hidden className="text-lg text-muted-foreground">›</span>
            <div className="rounded-2xl border-2 border-[#0055A0] bg-white p-3">
              <p className="text-muted-foreground">Novo</p>
              <p className="font-semibold">{target.name}</p>
              <p className="tabular-nums text-muted-foreground">{money(target.priceCents)}/mês</p>
            </div>
          </div>

          <div className="mt-5 border-t border-black/10 pt-5 text-sm" aria-live="polite">
            {quote.loading ? (
              <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" aria-hidden />Calculando a troca…</p>
            ) : data && data.kind === "upgrade" && !data.immediate ? (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">Cobrança agora</p>
                  <p className="text-2xl font-bold tabular-nums tracking-[-0.02em]">{money(data.amountCents)}</p>
                </div>
                <p className="mt-1 text-muted-foreground">
                  Diferença proporcional até o fim do ciclo atual. O limite de {target.activeStudentLimit} alunos ativos é liberado depois do pagamento confirmado. A próxima mensalidade passa a ser {money(target.priceCents)}.
                </p>
              </>
            ) : data && data.immediate ? (
              <p className="leading-relaxed">A troca vale agora, sem cobrança avulsa. A próxima mensalidade passa a ser {money(target.priceCents)}.</p>
            ) : data && data.kind === "downgrade" ? (
              <p className="leading-relaxed">
                A redução para {target.name} entra em vigor em <strong>{data.appliesAt ? dateLabel(data.appliesAt) : "seu próximo vencimento"}</strong>. Até lá, novas ativações respeitam o limite de {target.activeStudentLimit} alunos.
              </p>
            ) : upgrade ? (
              <p className="leading-relaxed">O aumento para {target.name} cobra agora a diferença proporcional restante do ciclo e libera o limite de {target.activeStudentLimit} alunos ativos depois do pagamento confirmado. A próxima mensalidade passa a ser {money(target.priceCents)}.</p>
            ) : (
              <p className="leading-relaxed">A redução para {target.name} entra no próximo vencimento, se os {activeStudentCount} alunos ativos couberem no limite de {target.activeStudentLimit}. Até lá, novas ativações respeitam esse limite.</p>
            )}
            {quote.error ? <p className="mt-3 text-destructive" role="alert">{quote.error}</p> : null}
            {tooSmall ? (
              <p className="mt-3 rounded-xl bg-[#F8B800]/20 p-3">
                Você tem {activeStudentCount} alunos ativos. O plano {target.name} aceita até {target.activeStudentLimit}.
              </p>
            ) : null}
          </div>
        </>
      )}

      {error ? <p className="mt-4 text-sm font-medium text-destructive" role="alert">{error}</p> : null}
      <Button className={cn(PRIMARY, "mt-5 w-full")} disabled={blocked || !changing || quote.loading} onClick={onChange}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {!changing ? "Escolha outro plano" : data?.immediate ? "Trocar plano agora" : upgrade ? "Pagar diferença e aumentar plano" : "Agendar redução de plano"}
      </Button>
      {changing && upgrade ? <div className="mt-4"><SecureNote /></div> : null}

      {canCancel ? (
        <div className="mt-6 border-t border-black/10 pt-5">
          <p className="text-sm text-muted-foreground">Cancelar interrompe a renovação automática. O acesso continua até o fim do período pago.</p>
          <Button type="button" variant="outline" className="mt-3 min-h-11 rounded-xl" disabled={blocked} onClick={onCancel}>
            Cancelar renovação
          </Button>
        </div>
      ) : null}
    </aside>
  );
}

/** Valor da troca calculado no servidor; o navegador nunca define o preço. */
function usePlanQuote(planId: SubscriptionPlanId | null) {
  const [state, setState] = useState<{ planId: SubscriptionPlanId | null; data: PlanChangeQuote | null; error: string | null }>({ planId: null, data: null, error: null });
  useEffect(() => {
    if (!planId) return;
    let alive = true;
    quoteSubscriptionPlanChange({ planId })
      .then((result) => {
        if (!alive) return;
        setState(result.ok ? { planId, data: result.data, error: null } : { planId, data: null, error: result.error });
      })
      .catch(() => {
        if (alive) setState({ planId, data: null, error: "Não foi possível calcular a troca agora." });
      });
    return () => { alive = false; };
  }, [planId]);
  const fresh = state.planId === planId;
  return { loading: Boolean(planId) && !fresh, data: fresh ? state.data : null, error: fresh ? state.error : null };
}

function CheckoutReturn({ subscription, confirmed }: { subscription: SubscriptionRecord; confirmed: boolean }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const plan = getSubscriptionPlan(subscription.plan_id);
  const steps = [
    { label: "Autorização feita na AbacatePay", done: true },
    { label: "Confirmação do pagamento", done: confirmed },
    { label: "Acesso liberado no Casca", done: confirmed },
  ];

  return (
    <section aria-labelledby="checkout-return-title" className="overflow-hidden rounded-3xl bg-white">
      <div className={cn("h-1.5", confirmed ? "bg-[#008037]" : "bg-[#F8B800]")} aria-hidden />
      <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div>
          <span className={cn("inline-flex size-12 items-center justify-center rounded-2xl", confirmed ? "bg-[#008037] text-white" : "bg-[#F8B800] text-neutral-950")}>
            {confirmed ? <Check className="size-6" strokeWidth={3} aria-hidden /> : <Clock className="size-6" aria-hidden />}
          </span>
          <h2 id="checkout-return-title" className="mt-5 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            {confirmed ? "Pagamento confirmado" : "Recebemos sua autorização"}
          </h2>
          <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:text-base" role="status">
            {confirmed
              ? `O plano ${plan?.name ?? ""} está ativo. Você já pode usar o Casca normalmente.`
              : "O acesso só é liberado depois da confirmação do pagamento. Atualize esta página para ver o status mais recente."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {!confirmed ? (
              <Button className={PRIMARY} disabled={refreshing} onClick={() => startRefresh(() => router.refresh())}>
                {refreshing ? <Loader2 className="animate-spin" aria-hidden /> : <RefreshCw aria-hidden />}
                Atualizar status
              </Button>
            ) : null}
            <Button asChild variant="outline" className="min-h-12 rounded-xl px-5">
              <Link href="/conta/assinatura">Ver minha assinatura</Link>
            </Button>
          </div>
        </div>

        <ol className="space-y-0 self-center" aria-label="Etapas da contratação">
          {steps.map((step, index) => {
            const last = index === steps.length - 1;
            return (
              <li key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      step.done ? "bg-[#008037] text-white" : "border-2 border-[#F8B800] bg-white text-neutral-900",
                    )}
                  >
                    {step.done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : index + 1}
                  </span>
                  {last ? null : <span aria-hidden className={cn("w-0.5 flex-1", step.done ? "bg-[#008037]" : "bg-black/10")} />}
                </div>
                <div className={cn("pt-0.5", last ? "" : "pb-6")}>
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.done ? "Concluído" : "Aguardando confirmação"}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}
