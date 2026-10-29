import { COMMERCIAL_TRIAL_DAYS, getSubscriptionPlan, type SubscriptionPlanId } from "./catalog";
import { proratedUpgradeCents } from "./proration";
import { checkoutInputSchema, planChangeInputSchema, subscriptionEventSchema } from "./validation";
import type {
  CheckoutOperation,
  PlanChangeQuote,
  SubscriptionActor,
  SubscriptionEventChange,
  SubscriptionGateway,
  SubscriptionRecord,
  SubscriptionRepository,
  SubscriptionResult,
} from "./types";

const UNAVAILABLE = "Não foi possível atualizar sua assinatura. Tente novamente em instantes.";
const MANAGE_ONLY = "Você já tem uma assinatura. Gerencie seu plano nesta página.";
const SUPPORTED_EVENTS = new Set(["subscription.trial_started", "subscription.completed", "subscription.renewed", "subscription.payment_failed", "subscription.cancelled", "subscription.plan_changed"]);
const REVERSED_EVENTS = new Set(["checkout.refunded", "checkout.disputed", "checkout.lost"]);

export function createSubscriptionService(dependencies: {
  repository: SubscriptionRepository;
  gateway: SubscriptionGateway;
  now?: () => Date;
}) {
  const { repository, gateway } = dependencies;
  const now = dependencies.now ?? (() => new Date());

  function professor(actor: SubscriptionActor | null): SubscriptionResult<never> | null {
    if (!actor || actor.role !== "professor") return { ok: false, error: "Somente o responsável pela academia pode gerenciar a assinatura." };
    return null;
  }

  async function quoteFor(subscription: SubscriptionRecord, targetPlanId: SubscriptionPlanId): Promise<SubscriptionResult<PlanChangeQuote>> {
    const current = getSubscriptionPlan(subscription.plan_id);
    const target = getSubscriptionPlan(targetPlanId);
    if (!current || !target || target.id === current.id) return { ok: false, error: "Escolha um plano diferente do atual." };
    const activeStudentCount = await repository.countActiveStudents(subscription.account_id);
    if (target.activeStudentLimit < activeStudentCount) {
      return { ok: false, error: `Esta academia tem ${activeStudentCount} alunos ativos. O plano ${target.name} comporta até ${target.activeStudentLimit}.` };
    }
    const kind = target.priceCents > current.priceCents ? "upgrade" : "downgrade";
    if (kind === "downgrade") {
      const appliesAt = subscription.paid_until && Date.parse(subscription.paid_until) > now().getTime()
        ? subscription.paid_until
        : subscription.trial_ends_at;
      if (!appliesAt || Date.parse(appliesAt) <= now().getTime()) return { ok: false, error: "Não há um ciclo vigente para agendar a redução de plano." };
      return { ok: true, data: { currentPlanId: current.id, targetPlanId: target.id, kind, amountCents: 0, appliesAt, immediate: false, targetLimit: target.activeStudentLimit, activeStudentCount } };
    }
    if (subscription.status === "trialing" && subscription.trial_ends_at && Date.parse(subscription.trial_ends_at) > now().getTime()) {
      return { ok: true, data: { currentPlanId: current.id, targetPlanId: target.id, kind, amountCents: 0, appliesAt: subscription.trial_ends_at, immediate: true, targetLimit: target.activeStudentLimit, activeStudentCount } };
    }
    if (!subscription.current_period_start || !subscription.paid_until) return { ok: false, error: "A troca de plano fica disponível depois da primeira cobrança confirmada." };
    const amountCents = proratedUpgradeCents({
      fromCents: current.priceCents, toCents: target.priceCents,
      periodStart: subscription.current_period_start, paidUntil: subscription.paid_until, now: now(),
    });
    if (amountCents == null) return { ok: false, error: "A diferença proporcional só pode ser cobrada durante o período já pago." };
    return { ok: true, data: { currentPlanId: current.id, targetPlanId: target.id, kind, amountCents, appliesAt: subscription.paid_until, immediate: false, targetLimit: target.activeStudentLimit, activeStudentCount } };
  }

  async function resumePaidUpgrade(subscription: SubscriptionRecord, operation: CheckoutOperation): Promise<SubscriptionResult<{ resumed: true } | { checkoutUrl: string }>> {
    if (!subscription.provider_subscription_id || !gateway.changePlan) return { ok: false, error: UNAVAILABLE };
    const change = await gateway.changePlan({ subscriptionId: subscription.provider_subscription_id, planId: operation.plan_id });
    if (change.status !== "PENDING" || change.newAmount !== getSubscriptionPlan(operation.plan_id)?.priceCents) return { ok: false, error: UNAVAILABLE };
    await repository.completeOperation({ operationId: operation.id, providerUpdateId: change.id, status: "completed" });
    return { ok: true, data: { resumed: true } };
  }

  return {
    async startCheckout(actor: SubscriptionActor | null, input: unknown): Promise<SubscriptionResult<{ checkoutUrl: string }>> {
      const denied = professor(actor);
      if (denied) return denied;
      const parsed = checkoutInputSchema.safeParse(input);
      if (!parsed.success) return { ok: false, error: "Escolha um dos planos disponíveis." };
      try {
        const subscription = await repository.get(actor!.accountId);
        if (!subscription) return { ok: false, error: "Sua assinatura ainda está sendo preparada. Tente novamente em instantes." };
        if (subscription.kind !== "commercial") return { ok: false, error: "Esta academia está dispensada de cobrança." };
        if (subscription.provider_subscription_id) {
          const existing = await gateway.getSubscription(subscription.provider_subscription_id);
          if (existing.status !== "CANCELLED") return { ok: false, error: "Você já tem uma assinatura. Use Gerenciar pagamentos para regularizar a cobrança sem contratar novamente." };
        }
        if (subscription.status === "active" || subscription.status === "trialing" || (subscription.paid_until && Date.parse(subscription.paid_until) > now().getTime())) {
          return { ok: false, error: MANAGE_ONLY };
        }
        const reservation = await repository.reserveCheckout(actor!.accountId, parsed.data.planId, subscription.version);
        if (!reservation.reserved) {
          if (reservation.operation.status === "ready" && reservation.operation.provider_checkout_url) return { ok: true, data: { checkoutUrl: reservation.operation.provider_checkout_url } };
          if (reservation.operation.status === "creating" && gateway.findCheckoutByOperation) {
            const recovered = await gateway.findCheckoutByOperation({ operationId: reservation.operation.id, planId: reservation.operation.plan_id, trial: !subscription.trial_used, customerId: subscription.provider_customer_id });
            if (recovered) {
              await repository.completeCheckout(reservation.operation.id, recovered.customerId, recovered);
              return { ok: true, data: { checkoutUrl: recovered.url } };
            }
          }
          return { ok: false, error: "Sua contratação está sendo preparada. Aguarde e atualize a página antes de tentar novamente." };
        }
        const customer = subscription.provider_customer_id
          ? { id: subscription.provider_customer_id }
          : await gateway.createCustomer({ email: actor!.email, name: actor!.name });
        const checkout = await gateway.createCheckout({ operationId: reservation.operation.id, planId: parsed.data.planId, customerId: customer.id, trial: !subscription.trial_used });
        await repository.completeCheckout(reservation.operation.id, customer.id, checkout);
        return { ok: true, data: { checkoutUrl: checkout.url } };
      } catch {
        return { ok: false, error: UNAVAILABLE };
      }
    },

    async quotePlanChange(actor: SubscriptionActor | null, input: unknown): Promise<SubscriptionResult<PlanChangeQuote>> {
      const denied = professor(actor);
      if (denied) return denied;
      const parsed = planChangeInputSchema.safeParse(input);
      if (!parsed.success) return { ok: false, error: "Escolha um dos planos disponíveis." };
      try {
        const subscription = await repository.get(actor!.accountId);
        if (!subscription || subscription.kind !== "commercial") return { ok: false, error: "Esta academia está dispensada de cobrança." };
        if (!["active", "trialing"].includes(subscription.status) && !(subscription.paid_until && Date.parse(subscription.paid_until) > now().getTime())) {
          return { ok: false, error: "A troca de plano fica disponível depois da adesão confirmada." };
        }
        return quoteFor(subscription, parsed.data.planId);
      } catch {
        return { ok: false, error: UNAVAILABLE };
      }
    },

    async startPlanChange(actor: SubscriptionActor | null, input: unknown): Promise<SubscriptionResult<{ checkoutUrl: string } | { scheduled: true; appliesAt: string } | { resumed: true } | { applied: true }>> {
      const denied = professor(actor);
      if (denied) return denied;
      const parsed = planChangeInputSchema.safeParse(input);
      if (!parsed.success) return { ok: false, error: "Escolha um dos planos disponíveis." };
      try {
        const subscription = await repository.get(actor!.accountId);
        if (!subscription || subscription.kind !== "commercial") return { ok: false, error: "Esta academia está dispensada de cobrança." };
        if (!subscription.provider_subscription_id) return { ok: false, error: MANAGE_ONLY };
        const quote = await quoteFor(subscription, parsed.data.planId);
        if (!quote.ok) return quote;
        const reservation = await repository.reserveOperation({
          accountId: actor!.accountId,
          kind: quote.data.kind,
          planId: quote.data.targetPlanId,
          amountCents: quote.data.amountCents || null,
          expectedVersion: subscription.version,
        });
        if (!reservation.reserved) {
          if (reservation.operation.kind === "upgrade" && reservation.operation.status === "paid") {
            return resumePaidUpgrade(subscription, reservation.operation);
          }
          if (reservation.operation.status === "ready" && reservation.operation.provider_checkout_url) {
            return { ok: true, data: { checkoutUrl: reservation.operation.provider_checkout_url } };
          }
          if (reservation.operation.kind === "upgrade" && reservation.operation.status === "creating" && gateway.findOneOffCheckoutByOperation && subscription.provider_customer_id && reservation.operation.amount_cents) {
            const recovered = await gateway.findOneOffCheckoutByOperation({ operationId: reservation.operation.id, amountCents: reservation.operation.amount_cents, customerId: subscription.provider_customer_id });
            if (recovered) {
              await repository.completeOperation({ operationId: reservation.operation.id, checkout: recovered, status: "ready" });
              return { ok: true, data: { checkoutUrl: recovered.url } };
            }
          }
          return { ok: false, error: "Sua troca de plano está sendo preparada. Aguarde e atualize a página." };
        }
        if (!gateway.changePlan) return { ok: false, error: UNAVAILABLE };
        if (quote.data.kind === "downgrade") {
          const change = await gateway.changePlan({ subscriptionId: subscription.provider_subscription_id, planId: quote.data.targetPlanId });
          if (change.status !== "PENDING" || change.newAmount !== getSubscriptionPlan(quote.data.targetPlanId)?.priceCents) return { ok: false, error: UNAVAILABLE };
          await repository.schedulePlanChange({ accountId: actor!.accountId, planId: quote.data.targetPlanId, at: quote.data.appliesAt!, expectedVersion: subscription.version + 1 });
          await repository.completeOperation({ operationId: reservation.operation.id, providerUpdateId: change.id, status: "completed" });
          return { ok: true, data: { scheduled: true, appliesAt: quote.data.appliesAt! } };
        }
        if (quote.data.immediate) {
          const change = await gateway.changePlan({ subscriptionId: subscription.provider_subscription_id, planId: quote.data.targetPlanId });
          if (change.status !== "PENDING" || change.newAmount !== getSubscriptionPlan(quote.data.targetPlanId)?.priceCents) return { ok: false, error: UNAVAILABLE };
          await repository.applyImmediatePlan({ accountId: actor!.accountId, planId: quote.data.targetPlanId, expectedVersion: subscription.version + 1 });
          await repository.completeOperation({ operationId: reservation.operation.id, providerUpdateId: change.id, status: "completed" });
          return { ok: true, data: { applied: true } };
        }
        if (!subscription.provider_customer_id || !gateway.createOneOffCheckout) return { ok: false, error: UNAVAILABLE };
        const checkout = await gateway.createOneOffCheckout({ operationId: reservation.operation.id, amountCents: quote.data.amountCents, customerId: subscription.provider_customer_id });
        await repository.completeOperation({ operationId: reservation.operation.id, checkout, status: "ready" });
        return { ok: true, data: { checkoutUrl: checkout.url } };
      } catch {
        return { ok: false, error: UNAVAILABLE };
      }
    },

    async cancelRenewal(actor: SubscriptionActor | null): Promise<SubscriptionResult<{ cancelled: true }>> {
      const denied = professor(actor);
      if (denied) return denied;
      try {
        const subscription = await repository.get(actor!.accountId);
        if (!subscription || subscription.kind !== "commercial") return { ok: false, error: "Esta academia está dispensada de cobrança." };
        if (subscription.status === "cancelled") return { ok: true, data: { cancelled: true } };
        if (!["active", "trialing"].includes(subscription.status)) return { ok: false, error: "Não há renovação ativa para cancelar." };
        const reservation = await repository.reserveOperation({
          accountId: actor!.accountId, kind: "cancel", planId: subscription.plan_id, amountCents: null, expectedVersion: subscription.version,
        });
        const operation = reservation.operation;
        if (subscription.provider_subscription_id && gateway.cancelSubscription) {
          try {
            await gateway.cancelSubscription(subscription.provider_subscription_id);
          } catch {
            const remote = await gateway.getSubscription(subscription.provider_subscription_id);
            if (remote.status !== "CANCELLED") throw new Error("cancel_failed");
          }
        }
        await repository.cancelRenewal(actor!.accountId, reservation.reserved ? subscription.version + 1 : subscription.version);
        await repository.completeOperation({ operationId: operation.id, status: "completed" });
        return { ok: true, data: { cancelled: true } };
      } catch {
        return { ok: false, error: UNAVAILABLE };
      }
    },

    async receiveEvent(input: unknown): Promise<SubscriptionResult<{ outcome: "applied" | "duplicate" | "stale" | "ignored" }>> {
      const parsed = subscriptionEventSchema.safeParse(input);
      if (!parsed.success || parsed.data.devMode !== gateway.devMode) return { ok: false, error: "Evento de assinatura inválido." };
      const event = parsed.data;
      if (REVERSED_EVENTS.has(event.event)) {
        const checkout = event.data.checkout;
        if (!checkout?.updatedAt) return { ok: false, error: "Evento financeiro inválido." };
        try {
          const subscription = await repository.findByCheckout(checkout.id);
          if (!subscription) return { ok: true, data: { outcome: "ignored" } };
          if (!subscription.provider_subscription_id || !subscription.provider_customer_id || (checkout.customerId && checkout.customerId !== subscription.provider_customer_id)) return { ok: false, error: "Assinatura não identificada." };
          const outcome = await repository.applyEvent({ eventId: event.id, eventName: event.event, accountId: subscription.account_id, occurredAt: checkout.updatedAt, providerSubscriptionId: subscription.provider_subscription_id, providerCheckoutId: checkout.id, providerCustomerId: subscription.provider_customer_id, status: "past_due", planId: subscription.plan_id, trialEndsAt: null, currentPeriodStart: subscription.current_period_start, paidUntil: null, paymentId: null, paymentAmount: null, receiptUrl: null, revokeAccess: true });
          return { ok: true, data: { outcome } };
        } catch { return { ok: false, error: UNAVAILABLE }; }
      }
      if (event.event === "checkout.completed") {
        return receiveUpgradePayment(event);
      }
      if (!SUPPORTED_EVENTS.has(event.event)) return { ok: true, data: { outcome: "ignored" } };
      if (!event.data.subscription) return { ok: false, error: "Evento de assinatura inválido." };
      try {
        const supplied = event.data.subscription;
        const remote = await gateway.getSubscription(supplied.id);
        if (remote.devMode !== gateway.devMode || remote.method !== "CARD" || remote.id !== supplied.id) return { ok: false, error: "Evento de assinatura inválido." };
        const checkoutId = event.data.checkout?.id ?? remote.checkoutId;
        const subscription = await repository.findByProvider(remote.id, checkoutId);
        if (!subscription || subscription.kind !== "commercial" || subscription.provider_customer_id !== remote.customerId || (event.data.customer && event.data.customer.id !== remote.customerId)) return { ok: false, error: "Assinatura não identificada." };
        if (subscription.provider_subscription_id && subscription.provider_subscription_id !== remote.id) return { ok: false, error: "Assinatura não identificada." };
        if (!subscription.provider_subscription_id && (!checkoutId || subscription.provider_checkout_id !== checkoutId)) return { ok: false, error: "Assinatura não identificada." };

        const plan = getSubscriptionPlan(subscription.plan_id)!;
        const pendingPlan = subscription.pending_plan_id ? getSubscriptionPlan(subscription.pending_plan_id) : null;
        const payment = event.data.payment;
        const eventTime = supplied.updatedAt;
        const change: SubscriptionEventChange = {
          eventId: event.id, eventName: event.event, accountId: subscription.account_id, occurredAt: eventTime,
          providerSubscriptionId: remote.id, providerCheckoutId: checkoutId, providerCustomerId: remote.customerId,
          status: subscription.status, planId: subscription.plan_id, trialEndsAt: subscription.trial_ends_at,
          currentPeriodStart: subscription.current_period_start, paidUntil: subscription.paid_until,
          paymentId: null, paymentAmount: null, receiptUrl: null,
        };

        if (event.event === "subscription.trial_started") {
          if (subscription.trial_used && subscription.provider_subscription_id !== remote.id) return { ok: false, error: "Período de avaliação já utilizado." };
          if (remote.status !== "ACTIVE" || remote.amount !== plan.priceCents || remote.trialDays !== COMMERCIAL_TRIAL_DAYS || !remote.trialEndsAt) return { ok: false, error: "Período de avaliação inválido." };
          const duration = Date.parse(remote.trialEndsAt) - Date.parse(remote.createdAt);
          if (duration <= 0 || duration > COMMERCIAL_TRIAL_DAYS * 86_400_000 + 60_000) return { ok: false, error: "Período de avaliação inválido." };
          change.status = "trialing";
          change.trialEndsAt = remote.trialEndsAt;
        } else if (event.event === "subscription.completed" || event.event === "subscription.renewed") {
          if (!payment || payment.status !== "PAID" || payment.paidAmount !== payment.amount) return { ok: false, error: "Pagamento ainda não confirmado." };
          const paidPlan = pendingPlan && payment.amount === pendingPlan.priceCents ? pendingPlan : plan;
          if (payment.amount !== paidPlan.priceCents) return { ok: false, error: "Pagamento não corresponde ao plano." };
          change.status = remote.status === "CANCELLED" ? "cancelled" : "active";
          change.planId = paidPlan.id;
          const period = paidPeriod(payment.updatedAt, remote.trialEndsAt ?? remote.createdAt);
          change.currentPeriodStart = period.start;
          change.paidUntil = period.end;
          change.occurredAt = payment.updatedAt;
          change.paymentId = payment.id;
          change.paymentAmount = payment.paidAmount;
          change.receiptUrl = safeReceiptUrl(payment.receiptUrl);
        } else if (event.event === "subscription.payment_failed") {
          change.status = "past_due";
        } else if (event.event === "subscription.cancelled") {
          change.status = "cancelled";
        } else if (event.event === "subscription.plan_changed") {
          change.status = subscription.status;
          change.planId = subscription.plan_id;
          change.paidUntil = subscription.paid_until;
        }
        const outcome = await repository.applyEvent(change);
        return { ok: true, data: { outcome } };
      } catch {
        return { ok: false, error: UNAVAILABLE };
      }
    },
  };

  async function receiveUpgradePayment(event: { id: string; event: string; data: { checkout?: { id: string; customerId?: string | null; updatedAt?: string }; customer?: { id: string } | null; payment?: { id: string; amount: number; paidAmount: number; status: string; updatedAt: string; receiptUrl?: string | null } } }): Promise<SubscriptionResult<{ outcome: "applied" | "duplicate" | "stale" | "ignored" }>> {
    const checkout = event.data.checkout;
    const payment = event.data.payment;
    if (!checkout?.id || !gateway.getCheckout) return { ok: false, error: "Evento financeiro inválido." };
    try {
      const remote = await gateway.getCheckout(checkout.id);
      if (remote.devMode !== gateway.devMode || remote.id !== checkout.id) return { ok: false, error: "Evento financeiro inválido." };
      let operation = await repository.findOperationByCheckout(remote.id);
      if (!operation && remote.externalId) operation = await repository.getOperation(remote.externalId);
      if (!operation || operation.kind !== "upgrade") return { ok: true, data: { outcome: "ignored" } };
      const subscription = await repository.get(operation.account_id);
      if (!subscription || subscription.kind !== "commercial" || !subscription.provider_customer_id) return { ok: false, error: "Assinatura não identificada." };
      if (remote.customerId && remote.customerId !== subscription.provider_customer_id) return { ok: false, error: "Assinatura não identificada." };
      if (event.data.customer && event.data.customer.id !== subscription.provider_customer_id) return { ok: false, error: "Assinatura não identificada." };
      if (remote.status !== "PAID" || remote.paidAmount !== operation.amount_cents || remote.amount !== operation.amount_cents) return { ok: false, error: "Pagamento ainda não confirmado." };
      if (!payment || payment.status !== "PAID" || payment.paidAmount !== payment.amount || payment.amount !== operation.amount_cents) return { ok: false, error: "Pagamento ainda não confirmado." };
      const outcome = await repository.applyUpgrade({
        accountId: subscription.account_id, planId: operation.plan_id, checkoutId: remote.id,
        paymentId: payment.id, amountCents: payment.paidAmount, occurredAt: payment.updatedAt,
        receiptUrl: safeReceiptUrl(payment.receiptUrl),
      });
      if (outcome === "duplicate") return { ok: true, data: { outcome } };
      if (subscription.provider_subscription_id && gateway.changePlan) {
        const change = await gateway.changePlan({ subscriptionId: subscription.provider_subscription_id, planId: operation.plan_id });
        if (change.status === "PENDING" && change.newAmount === getSubscriptionPlan(operation.plan_id)?.priceCents) {
          await repository.completeOperation({ operationId: operation.id, providerUpdateId: change.id, status: "completed" });
        } else {
          await repository.completeOperation({ operationId: operation.id, status: "paid" });
        }
      } else {
        await repository.completeOperation({ operationId: operation.id, status: "paid" });
      }
      return { ok: true, data: { outcome: "applied" } };
    } catch {
      return { ok: false, error: UNAVAILABLE };
    }
  }
}

function anchoredMonth(value: string, months: number): string {
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString();
}

function paidPeriod(paymentAt: string, anchorAt: string): { start: string; end: string } {
  const payment = new Date(paymentAt);
  const anchor = new Date(anchorAt);
  let months = Math.max(0, (payment.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + payment.getUTCMonth() - anchor.getUTCMonth());
  if (Date.parse(anchoredMonth(anchorAt, months)) > payment.getTime()) months = Math.max(0, months - 1);
  return { start: anchoredMonth(anchorAt, months), end: anchoredMonth(anchorAt, months + 1) };
}

function safeReceiptUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["app.abacatepay.com", "abacatepay.com"].includes(url.hostname) ? url.toString() : null;
  } catch { return null; }
}
