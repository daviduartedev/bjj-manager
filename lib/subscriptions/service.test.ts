import { describe, expect, it, vi } from "vitest";

import { createSubscriptionService } from "./service";
import type { SubscriptionActor, SubscriptionGateway, SubscriptionRecord, SubscriptionRepository } from "./types";

const now = new Date("2026-10-29T12:00:00.000Z");
const actor: SubscriptionActor = { accountId: "academy-a", userId: "owner-a", email: "owner@example.test", name: "Ana", role: "professor" };
const record: SubscriptionRecord = {
  account_id: actor.accountId, kind: "commercial", status: "pending", plan_id: "essencial",
  provider_customer_id: "cust_a", provider_checkout_id: "bill_a", provider_checkout_url: "https://app.abacatepay.com/pay/bill_a",
  provider_subscription_id: null, trial_used: false, trial_ends_at: null, current_period_start: null, paid_until: null,
  pending_plan_id: null, pending_plan_at: null, last_event_at: null, version: 0,
  created_at: now.toISOString(), updated_at: now.toISOString(),
};

function emptyOperation() {
  return { id: "operation-a", account_id: actor.accountId, kind: "checkout" as const, plan_id: "inicial" as const, status: "creating" as const, amount_cents: null, provider_checkout_id: null, provider_checkout_url: null, provider_update_id: null };
}

function fixture(overrides: Partial<SubscriptionRecord> = {}) {
  const stored = { ...record, ...overrides };
  const repository: SubscriptionRepository = {
    get: vi.fn().mockResolvedValue(stored),
    countActiveStudents: vi.fn().mockResolvedValue(12),
    reserveCheckout: vi.fn().mockResolvedValue({ reserved: true, operation: emptyOperation() }),
    completeCheckout: vi.fn().mockResolvedValue(undefined),
    findByProvider: vi.fn().mockResolvedValue(stored),
    findByCheckout: vi.fn().mockResolvedValue(stored),
    applyEvent: vi.fn().mockResolvedValue("applied"),
    reserveOperation: vi.fn().mockResolvedValue({ reserved: true, operation: { ...emptyOperation(), id: "operation-up", kind: "upgrade", plan_id: "academia_100", amount_cents: 1595 } }),
    completeOperation: vi.fn().mockResolvedValue(undefined),
    getOperation: vi.fn().mockResolvedValue(null),
    findOperationByCheckout: vi.fn().mockResolvedValue(null),
    applyUpgrade: vi.fn().mockResolvedValue("applied"),
    schedulePlanChange: vi.fn().mockResolvedValue(undefined),
    applyImmediatePlan: vi.fn().mockResolvedValue(undefined),
    cancelRenewal: vi.fn().mockResolvedValue(undefined),
  };
  const gateway: SubscriptionGateway = {
    devMode: true,
    createCustomer: vi.fn().mockResolvedValue({ id: "cust_a" }),
    createCheckout: vi.fn().mockResolvedValue({ id: "bill_b", url: "https://app.abacatepay.com/pay/bill_b" }),
    getSubscription: vi.fn().mockResolvedValue({ id: "subs_a", checkoutId: "bill_a", customerId: "cust_a", amount: 9900, status: "ACTIVE", method: "CARD", devMode: true, trialDays: 3, trialEndsAt: "2026-11-01T12:00:00.000Z", createdAt: now.toISOString(), updatedAt: now.toISOString() }),
    createOneOffCheckout: vi.fn().mockResolvedValue({ id: "bill_up", url: "https://app.abacatepay.com/pay/bill_up" }),
    getCheckout: vi.fn().mockResolvedValue({ id: "bill_up", amount: 1595, paidAmount: 1595, customerId: "cust_a", externalId: "operation-up", status: "PAID", frequency: "ONE_TIME", devMode: true, updatedAt: now.toISOString() }),
    changePlan: vi.fn().mockResolvedValue({ id: "subu_a", subscriptionId: "subs_a", productId: "prod_academia_100", newAmount: 12990, status: "PENDING" }),
    cancelSubscription: vi.fn().mockResolvedValue(undefined),
  };
  return { repository, gateway, service: createSubscriptionService({ repository, gateway, now: () => now }), stored };
}

function trialEvent() {
  return { id: "log_trial_a", event: "subscription.trial_started", apiVersion: 2, devMode: true, data: { subscription: { id: "subs_a", amount: 9900, status: "ACTIVE", method: "CARD", frequency: "MONTHLY", trialDays: 3, trialEndsAt: "2026-11-01T12:00:00.000Z", createdAt: now.toISOString(), updatedAt: now.toISOString() }, customer: { id: "cust_a", email: actor.email } } };
}

describe("contratação comercial da academia", () => {
  it("inicia somente o checkout do plano escolhido com trial, sem liberar a academia antes do evento", async () => {
    const { service, repository, gateway } = fixture();
    const result = await service.startCheckout(actor, { planId: "inicial" });
    expect(result).toEqual({ ok: true, data: { checkoutUrl: "https://app.abacatepay.com/pay/bill_b" } });
    expect(gateway.createCheckout).toHaveBeenCalledWith({ operationId: "operation-a", planId: "inicial", customerId: "cust_a", trial: true });
    expect(repository.applyEvent).not.toHaveBeenCalled();
  });

  it("recusa aluno e campos financeiros ou tenant enviados pelo navegador antes de cobrar", async () => {
    const { service, gateway } = fixture();
    expect((await service.startCheckout({ ...actor, role: "student" }, { planId: "inicial" })).ok).toBe(false);
    expect((await service.startCheckout(actor, { planId: "inicial", accountId: "other", amount: 1 })).ok).toBe(false);
    expect(gateway.createCheckout).not.toHaveBeenCalled();
  });

  it("não concede outro trial a uma academia que já usou o benefício", async () => {
    const { service, gateway } = fixture({ status: "cancelled", trial_used: true });
    await service.startCheckout(actor, { planId: "inicial" });
    expect(gateway.createCheckout).toHaveBeenCalledWith(expect.objectContaining({ trial: false }));
  });

  it("retoma checkout persistido sem abrir outra cobrança", async () => {
    const { service, repository, gateway } = fixture();
    vi.mocked(repository.reserveCheckout).mockResolvedValue({ reserved: false, operation: { ...emptyOperation(), status: "ready", provider_checkout_id: "bill_a", provider_checkout_url: record.provider_checkout_url } });
    expect(await service.startCheckout(actor, { planId: "inicial" })).toMatchObject({ ok: true, data: { checkoutUrl: record.provider_checkout_url } });
    expect(gateway.createCheckout).not.toHaveBeenCalled();
  });

  it("reconcilia o trial sem checkout no payload e aplica a confirmação confiável", async () => {
    const { service, repository, gateway } = fixture();
    expect(await service.receiveEvent(trialEvent())).toEqual({ ok: true, data: { outcome: "applied" } });
    expect(gateway.getSubscription).toHaveBeenCalledWith("subs_a");
    expect(repository.applyEvent).toHaveBeenCalledWith(expect.objectContaining({ accountId: actor.accountId, eventId: "log_trial_a", status: "trialing", trialEndsAt: "2026-11-01T12:00:00.000Z", paidUntil: null }));
  });

  it("ignora evento de outro ambiente ou cliente sem alterar a assinatura", async () => {
    const { service, repository, gateway } = fixture();
    expect((await service.receiveEvent({ ...trialEvent(), devMode: false })).ok).toBe(false);
    vi.mocked(gateway.getSubscription).mockResolvedValue({ ...(await gateway.getSubscription("subs_a")), customerId: "cust_attacker" });
    expect((await service.receiveEvent(trialEvent())).ok).toBe(false);
    expect(repository.applyEvent).not.toHaveBeenCalled();
  });

  it("reconcilia uma resposta de checkout perdida sem repetir a chamada financeira", async () => {
    const { service, repository, gateway } = fixture();
    vi.mocked(repository.reserveCheckout).mockResolvedValue({ reserved: false, operation: emptyOperation() });
    gateway.findCheckoutByOperation = vi.fn().mockResolvedValue({ id: "bill_recovered", url: "https://app.abacatepay.com/pay/bill_recovered", customerId: "cust_a" });
    expect(await service.startCheckout(actor, { planId: "inicial" })).toEqual({ ok: true, data: { checkoutUrl: "https://app.abacatepay.com/pay/bill_recovered" } });
    expect(gateway.createCheckout).not.toHaveBeenCalled();
    expect(repository.completeCheckout).toHaveBeenCalledWith("operation-a", "cust_a", expect.objectContaining({ id: "bill_recovered" }));
  });

  it("conserva 31 como ancora da renovação depois de fevereiro", async () => {
    const { service, repository, gateway } = fixture({ status: "active", provider_subscription_id: "subs_a", current_period_start: "2026-01-31T12:00:00.000Z", paid_until: "2026-02-28T12:00:00.000Z" });
    vi.mocked(gateway.getSubscription).mockResolvedValue({ ...(await gateway.getSubscription("subs_a")), trialDays: null, trialEndsAt: null, createdAt: "2026-01-31T12:00:00.000Z", updatedAt: "2026-02-28T12:00:05.000Z" });
    const event = { ...trialEvent(), id: "log_renewal", event: "subscription.renewed", data: { ...trialEvent().data, payment: { id: "char_feb", amount: 9900, paidAmount: 9900, status: "PAID", updatedAt: "2026-02-28T12:00:05.000Z", receiptUrl: "nota-invalida" } } };
    expect((await service.receiveEvent(event)).ok).toBe(true);
    expect(repository.applyEvent).toHaveBeenCalledWith(expect.objectContaining({ status: "active", currentPeriodStart: "2026-02-28T12:00:00.000Z", paidUntil: "2026-03-31T12:00:00.000Z", receiptUrl: null }));
  });

  it("registra pagamento confirmado entregue depois do cancelamento sem reabrir a renovação", async () => {
    const { service, repository, gateway } = fixture({ status: "cancelled", provider_subscription_id: "subs_a" });
    vi.mocked(gateway.getSubscription).mockResolvedValue({ ...(await gateway.getSubscription("subs_a")), status: "CANCELLED", trialDays: null, trialEndsAt: null });
    const event = { ...trialEvent(), event: "subscription.completed", data: { ...trialEvent().data, payment: { id: "char_a", amount: 9900, paidAmount: 9900, status: "PAID", updatedAt: now.toISOString() } } };
    expect((await service.receiveEvent(event)).ok).toBe(true);
    expect(repository.applyEvent).toHaveBeenCalledWith(expect.objectContaining({ status: "cancelled", paidUntil: "2026-11-29T12:00:00.000Z" }));
  });

  it("revoga período pago quando chega estorno de checkout conhecido", async () => {
    const { service, repository } = fixture({ status: "active", provider_subscription_id: "subs_a", paid_until: "2026-11-29T12:00:00.000Z" });
    const event = { id: "log_refund", event: "checkout.refunded", apiVersion: 2, devMode: true, data: { checkout: { id: "bill_a", customerId: "cust_a", updatedAt: now.toISOString() } } };
    expect((await service.receiveEvent(event)).ok).toBe(true);
    expect(repository.applyEvent).toHaveBeenCalledWith(expect.objectContaining({ status: "past_due", paidUntil: null, revokeAccess: true }));
  });

  it("mantém idempotência retornada pela persistência sem efeitos financeiros adicionais", async () => {
    const { service, repository, gateway } = fixture();
    vi.mocked(repository.applyEvent).mockResolvedValue("duplicate");
    expect(await service.receiveEvent(trialEvent())).toEqual({ ok: true, data: { outcome: "duplicate" } });
    expect(gateway.createCheckout).not.toHaveBeenCalled();
  });

  it("recontrata uma assinatura encerrada sem repetir trial e aceita a nova confirmação", async () => {
    const { service, repository, gateway } = fixture({ status: "cancelled", provider_subscription_id: "subs_old", trial_used: true, paid_until: "2026-09-29T12:00:00.000Z" });
    vi.mocked(gateway.getSubscription).mockImplementation(async (id) => ({ id, checkoutId: id === "subs_old" ? "bill_a" : "bill_b", customerId: "cust_a", amount: 9900, status: id === "subs_old" ? "CANCELLED" : "ACTIVE", method: "CARD", devMode: true, trialDays: null, trialEndsAt: null, createdAt: now.toISOString(), updatedAt: now.toISOString() }));
    vi.mocked(repository.completeCheckout).mockImplementation(async () => {
      const stored = await repository.get(actor.accountId);
      Object.assign(stored!, { provider_subscription_id: null, provider_checkout_id: "bill_b", status: "pending", paid_until: null, current_period_start: null });
    });
    const checkout = await service.startCheckout(actor, { planId: "inicial" });
    expect(checkout.ok).toBe(true);
    expect(gateway.createCheckout).toHaveBeenCalledWith(expect.objectContaining({ trial: false }));
    const event = { ...trialEvent(), event: "subscription.completed", data: { subscription: { ...trialEvent().data.subscription, id: "subs_new", trialDays: null, trialEndsAt: null }, checkout: { id: "bill_b" }, customer: { id: "cust_a" }, payment: { id: "char_new", amount: 9900, paidAmount: 9900, status: "PAID", updatedAt: now.toISOString() } } };
    expect(await service.receiveEvent(event)).toEqual({ ok: true, data: { outcome: "applied" } });
    expect(repository.applyEvent).toHaveBeenCalledWith(expect.objectContaining({ providerSubscriptionId: "subs_new", status: "active" }));
  });
});

const t3Now = new Date("2026-11-13T12:00:00.000Z");
const paid = {
  status: "active" as const,
  provider_subscription_id: "subs_a",
  current_period_start: "2026-10-29T12:00:00.000Z",
  paid_until: "2026-11-29T12:00:00.000Z",
};

function t3Fixture(overrides: Partial<SubscriptionRecord> = {}) {
  const base = fixture({ ...paid, ...overrides });
  return { ...base, service: createSubscriptionService({ repository: base.repository, gateway: base.gateway, now: () => t3Now }) };
}

function upgradeEvent() {
  return {
    id: "log_upgrade", event: "checkout.completed", apiVersion: 2, devMode: true,
    data: {
      checkout: { id: "bill_up", customerId: "cust_a", updatedAt: now.toISOString() },
      customer: { id: "cust_a" },
      payment: { id: "char_up", amount: 1595, paidAmount: 1595, status: "PAID", updatedAt: now.toISOString() },
    },
  };
}

describe("cancelamento e troca de plano", () => {
  it("cancela a renovação e preserva o período já pago, sem abrir checkout", async () => {
    const { service, repository, gateway } = t3Fixture();
    expect(await service.cancelRenewal(actor)).toEqual({ ok: true, data: { cancelled: true } });
    expect(gateway.cancelSubscription).toHaveBeenCalledWith("subs_a");
    expect(repository.cancelRenewal).toHaveBeenCalledWith(actor.accountId, 1);
    expect(gateway.createCheckout).not.toHaveBeenCalled();
    expect(gateway.createOneOffCheckout).not.toHaveBeenCalled();
  });

  it("mostra o valor proporcional calculado no servidor e recusa preço enviado pelo navegador", async () => {
    const { service, gateway } = t3Fixture({ plan_id: "essencial" });
    const quote = await service.quotePlanChange(actor, { planId: "academia_100" });
    expect(quote).toEqual({ ok: true, data: expect.objectContaining({ kind: "upgrade", amountCents: 1595, immediate: false, targetLimit: 100 }) });
    expect((await service.quotePlanChange(actor, { planId: "academia_100", amountCents: 1 })).ok).toBe(false);
    expect((await service.startPlanChange({ ...actor, role: "student" }, { planId: "academia_100" })).ok).toBe(false);
    expect(gateway.createOneOffCheckout).not.toHaveBeenCalled();
  });

  it("só libera o limite do upgrade depois do pagamento avulso confirmado", async () => {
    const { service, repository, gateway } = t3Fixture({ plan_id: "essencial" });
    expect(await service.startPlanChange(actor, { planId: "academia_100" })).toEqual({ ok: true, data: { checkoutUrl: "https://app.abacatepay.com/pay/bill_up" } });
    expect(gateway.createOneOffCheckout).toHaveBeenCalledWith({ operationId: "operation-up", amountCents: 1595, customerId: "cust_a" });
    expect(repository.applyUpgrade).not.toHaveBeenCalled();
    expect(gateway.changePlan).not.toHaveBeenCalled();
    vi.mocked(repository.findOperationByCheckout).mockResolvedValue({ id: "operation-up", account_id: actor.accountId, kind: "upgrade", plan_id: "academia_100", status: "ready", amount_cents: 1595, provider_checkout_id: "bill_up", provider_checkout_url: "https://app.abacatepay.com/pay/bill_up", provider_update_id: null });
    expect(await service.receiveEvent(upgradeEvent())).toEqual({ ok: true, data: { outcome: "applied" } });
    expect(repository.applyUpgrade).toHaveBeenCalledWith(expect.objectContaining({ accountId: actor.accountId, planId: "academia_100", amountCents: 1595, paymentId: "char_up" }));
    expect(gateway.changePlan).toHaveBeenCalledWith({ subscriptionId: "subs_a", planId: "academia_100" });
  });

  it("retoma a sincronização do plano recorrente sem criar outra cobrança", async () => {
    const { service, repository, gateway } = t3Fixture({ plan_id: "essencial" });
    vi.mocked(repository.reserveOperation).mockResolvedValue({ reserved: false, operation: { id: "operation-up", account_id: actor.accountId, kind: "upgrade", plan_id: "academia_100", status: "paid", amount_cents: 1595, provider_checkout_id: "bill_up", provider_checkout_url: "https://app.abacatepay.com/pay/bill_up", provider_update_id: null } });
    expect(await service.startPlanChange(actor, { planId: "academia_100" })).toEqual({ ok: true, data: { resumed: true } });
    expect(gateway.createOneOffCheckout).not.toHaveBeenCalled();
    expect(gateway.changePlan).toHaveBeenCalledWith({ subscriptionId: "subs_a", planId: "academia_100" });
    expect(repository.completeOperation).toHaveBeenCalledWith(expect.objectContaining({ operationId: "operation-up", providerUpdateId: "subu_a", status: "completed" }));
  });

  it("ignora checkout de upgrade repetido ou sem pagamento confirmado", async () => {
    const { service, repository, gateway } = t3Fixture({ plan_id: "essencial" });
    vi.mocked(repository.findOperationByCheckout).mockResolvedValue({ id: "operation-up", account_id: actor.accountId, kind: "upgrade", plan_id: "academia_100", status: "ready", amount_cents: 1595, provider_checkout_id: "bill_up", provider_checkout_url: "https://app.abacatepay.com/pay/bill_up", provider_update_id: null });
    const unpaid = upgradeEvent();
    unpaid.data.payment.status = "PENDING";
    unpaid.data.payment.paidAmount = 0;
    vi.mocked(gateway.getCheckout!).mockResolvedValue({ id: "bill_up", amount: 1595, paidAmount: 0, customerId: "cust_a", externalId: "operation-up", status: "PENDING", frequency: "ONE_TIME", devMode: true, updatedAt: now.toISOString() });
    expect((await service.receiveEvent(unpaid)).ok).toBe(false);
    expect(repository.applyUpgrade).not.toHaveBeenCalled();
    vi.mocked(gateway.getCheckout!).mockResolvedValue({ id: "bill_up", amount: 1595, paidAmount: 1595, customerId: "cust_a", externalId: "operation-up", status: "PAID", frequency: "ONE_TIME", devMode: true, updatedAt: now.toISOString() });
    vi.mocked(repository.applyUpgrade).mockResolvedValue("duplicate");
    expect(await service.receiveEvent(upgradeEvent())).toEqual({ ok: true, data: { outcome: "duplicate" } });
    expect(gateway.changePlan).not.toHaveBeenCalled();
  });

  it("agenda downgrade no próximo ciclo só se os alunos ativos couberem", async () => {
    const { service, repository, gateway } = t3Fixture({ plan_id: "academia" });
    vi.mocked(gateway.changePlan!).mockResolvedValue({ id: "subu_down", subscriptionId: "subs_a", productId: "prod_inicial", newAmount: 7990, status: "PENDING" });
    vi.mocked(repository.reserveOperation).mockResolvedValue({ reserved: true, operation: { ...emptyOperation(), id: "operation-down", kind: "downgrade", plan_id: "inicial" } });
    expect(await service.startPlanChange(actor, { planId: "inicial" })).toEqual({ ok: true, data: { scheduled: true, appliesAt: paid.paid_until } });
    expect(gateway.createOneOffCheckout).not.toHaveBeenCalled();
    expect(gateway.changePlan).toHaveBeenCalledWith({ subscriptionId: "subs_a", planId: "inicial" });
    expect(repository.schedulePlanChange).toHaveBeenCalledWith(expect.objectContaining({ planId: "inicial", at: paid.paid_until }));
    vi.mocked(repository.countActiveStudents).mockResolvedValue(51);
    expect((await service.startPlanChange(actor, { planId: "inicial" })).ok).toBe(false);
  });

  it("recusa contratar ou trocar para plano legado, que não é mais oferecido", async () => {
    const { service, gateway } = fixture();
    expect((await service.startCheckout(actor, { planId: "essencial" })).ok).toBe(false);
    expect(gateway.createCheckout).not.toHaveBeenCalled();
    const paidLegacy = t3Fixture({ plan_id: "inicial" });
    expect((await paidLegacy.service.quotePlanChange(actor, { planId: "evolucao" })).ok).toBe(false);
    expect((await paidLegacy.service.startPlanChange(actor, { planId: "academia" })).ok).toBe(false);
  });

  it("assinante legado troca para o Ilimitado sem teto de alunos ativos", async () => {
    const { service, repository } = t3Fixture({ plan_id: "evolucao" });
    vi.mocked(repository.countActiveStudents).mockResolvedValue(450);
    const quote = await service.quotePlanChange(actor, { planId: "ilimitado" });
    expect(quote).toEqual({ ok: true, data: expect.objectContaining({ currentPlanId: "evolucao", targetPlanId: "ilimitado", kind: "downgrade", targetLimit: Number.POSITIVE_INFINITY }) });
  });

  it("não antecipa capacidade nem acesso no evento plan_changed", async () => {
    const { service, repository, gateway } = t3Fixture({ plan_id: "essencial", pending_plan_id: "academia_100", pending_plan_at: paid.paid_until });
    const event = { ...trialEvent(), id: "log_plan", event: "subscription.plan_changed", data: { ...trialEvent().data, subscription: { ...trialEvent().data.subscription, amount: 12990 } } };
    vi.mocked(gateway.getSubscription).mockResolvedValue({ ...(await gateway.getSubscription("subs_a")), amount: 12990, trialDays: null, trialEndsAt: null });
    expect(await service.receiveEvent(event)).toEqual({ ok: true, data: { outcome: "applied" } });
    expect(repository.applyEvent).toHaveBeenCalledWith(expect.objectContaining({ eventName: "subscription.plan_changed", planId: "essencial", paidUntil: paid.paid_until, status: "active" }));
  });
});
