import { describe, expect, it } from "vitest";

import { getSubscriptionAccess } from "./access";
import type { SubscriptionRecord } from "./types";

const now = new Date("2026-10-29T12:00:00Z");
const subscription = (patch: Partial<SubscriptionRecord> = {}): SubscriptionRecord => ({
  account_id: "academy-a", kind: "commercial", status: "pending", plan_id: "essencial",
  provider_customer_id: null, provider_checkout_id: null, provider_checkout_url: null,
  provider_subscription_id: null, trial_used: false, trial_ends_at: null,
  current_period_start: null, paid_until: null, pending_plan_id: null, pending_plan_at: null,
  last_event_at: null, version: 0, created_at: now.toISOString(), updated_at: now.toISOString(),
  ...patch,
});

describe("acesso operacional da assinatura Casca", () => {
  it("mantem a operacao existente enquanto a ativacao controlada esta desligada", () => {
    expect(getSubscriptionAccess(null, now, false)).toMatchObject({ canWrite: true, activeStudentLimit: null });
  });

  it("nao concede escrita quando a academia nao contratou apos a ativacao", () => {
    expect(getSubscriptionAccess(null, now, true)).toMatchObject({ canWrite: false, reason: "missing" });
    expect(getSubscriptionAccess(subscription(), now, true)).toMatchObject({ canWrite: false, reason: "pending", activeStudentLimit: 50 });
  });

  it("encerra a avaliacao exatamente no fim dos tres dias confirmados", () => {
    const trial = subscription({ status: "trialing", trial_ends_at: "2026-10-29T12:00:00Z" });
    expect(getSubscriptionAccess(trial, new Date("2026-10-29T11:59:59Z"), true).canWrite).toBe(true);
    expect(getSubscriptionAccess(trial, now, true)).toMatchObject({ canWrite: false, reason: "expired" });
  });

  it("preserva o periodo pago apos cancelar ou falhar a proxima renovacao", () => {
    for (const status of ["active", "cancelled", "past_due"] as const) {
      expect(getSubscriptionAccess(subscription({ status, paid_until: "2026-11-01T00:00:00Z" }), now, true).canWrite).toBe(true);
      expect(getSubscriptionAccess(subscription({ status, paid_until: "2026-10-29T12:00:00Z" }), now, true).canWrite).toBe(false);
    }
  });

  it("preserva a avaliacao restante quando a renovacao e cancelada antes da primeira cobranca", () => {
    const cancelledTrial = subscription({ status: "cancelled", trial_ends_at: "2026-11-01T12:00:00Z" });
    expect(getSubscriptionAccess(cancelledTrial, now, true)).toMatchObject({ canWrite: true, reason: "trialing" });
    expect(getSubscriptionAccess(cancelledTrial, new Date("2026-11-01T12:00:00Z"), true).canWrite).toBe(false);
  });

  it("permite testes internos e isencoes sem prazo e conserva a capacidade contratada", () => {
    expect(getSubscriptionAccess(subscription({ kind: "exempt", plan_id: "academia" }), now, true))
      .toMatchObject({ canWrite: true, reason: "exempt", activeStudentLimit: 150 });
    expect(getSubscriptionAccess(subscription({ kind: "internal_test", plan_id: "evolucao" }), now, true))
      .toMatchObject({ canWrite: true, reason: "internal_test", activeStudentLimit: 300 });
  });

  it("reserva capacidade para o downgrade agendado sem antecipar upgrades", () => {
    const paid = { status: "active", paid_until: "2026-11-01T00:00:00Z", pending_plan_at: "2026-11-01T00:00:00Z" } as const;
    expect(getSubscriptionAccess(subscription({ ...paid, plan_id: "academia", pending_plan_id: "essencial" }), now, true).activeStudentLimit).toBe(50);
    expect(getSubscriptionAccess(subscription({ ...paid, pending_plan_id: "academia" }), now, true).activeStudentLimit).toBe(50);
  });

  it("plano Ilimitado escreve sem teto e só ganha limite ao reduzir para plano com teto", () => {
    const paid = { status: "active", paid_until: "2026-11-01T00:00:00Z", pending_plan_at: "2026-11-01T00:00:00Z" } as const;
    expect(getSubscriptionAccess(subscription({ ...paid, plan_id: "ilimitado", pending_plan_at: null }), now, true))
      .toMatchObject({ canWrite: true, activeStudentLimit: Number.POSITIVE_INFINITY });
    expect(getSubscriptionAccess(subscription({ ...paid, plan_id: "ilimitado", pending_plan_id: "inicial" }), now, true).activeStudentLimit).toBe(50);
    expect(getSubscriptionAccess(subscription({ ...paid, plan_id: "evolucao", pending_plan_id: "ilimitado" }), now, true).activeStudentLimit).toBe(300);
  });
});
