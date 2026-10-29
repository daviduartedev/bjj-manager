import { describe, expect, it } from "vitest";

import { processSubscriptionNotifications } from "./process";
import type { CommercialEmailSubscription, Notification, NotificationRepository, SubscriptionEmail } from "./types";

const now = new Date("2026-10-29T12:00:00Z");
function database(patch: Partial<Notification> = {}) {
  const notification: Notification = {
    id: "notification-a", event_id: "event-a", account_id: "academy-a", kind: "subscription.trial_started",
    payload: { planId: "essencial", trialEndsAt: "2026-11-01T12:00:00Z" }, status: "pending",
    attempts: 0, first_attempt_at: null, delivery_json: null, claim_token: "lease-a", provider_email_id: null, manual_review: false,
    ...patch,
  };
  let subscription: CommercialEmailSubscription | null = { kind: "commercial", status: "trialing", plan_id: "essencial", trial_ends_at: "2026-11-01T12:00:00Z", paid_until: null };
  let recipient = "responsavel@example.test";
  const repository: NotificationRepository = {
    claim: async () => {
      if (notification.status === "sent" || notification.status === "cancelled" || notification.manual_review) return [];
      notification.attempts += 1;
      return [{ ...notification }];
    },
    getSubscription: async () => subscription,
    getRecipient: async () => recipient,
    prepare: async (_row, message, at) => {
      notification.delivery_json ??= message;
      notification.first_attempt_at ??= at.toISOString();
      return { message: notification.delivery_json, firstAttemptAt: notification.first_attempt_at };
    },
    sent: async (_row, id) => { notification.status = "sent"; notification.provider_email_id = id; },
    cancel: async () => { notification.status = "cancelled"; },
    fail: async (_row, _code, _at, manual) => { notification.status = "failed"; notification.manual_review = manual; },
  };
  return { repository, setSubscription: (value: CommercialEmailSubscription | null) => { subscription = value; }, setRecipient: (value: string) => { recipient = value; } };
}

describe("notificacoes comerciais pela fronteira publica", () => {
  it("envia a adesao uma unica vez mesmo depois de nova execucao do job", async () => {
    const { repository } = database();
    const delivered: SubscriptionEmail[] = [];
    const gateway = { send: async (message: SubscriptionEmail) => { delivered.push(message); return { id: "email-a" }; } };
    const deps = { repository, gateway, from: "Casca <conta@example.test>", appUrl: "https://casca.example.test", now: () => now };
    expect(await processSubscriptionNotifications(deps)).toMatchObject({ sent: 1 });
    expect(await processSubscriptionNotifications(deps)).toMatchObject({ sent: 0 });
    expect(delivered).toHaveLength(1);
    expect(delivered[0]).toMatchObject({ to: "responsavel@example.test", subject: "Sua avaliação do Casca começou" });
    expect(delivered[0].text).toContain("R$ 99,00");
  });

  it("nao avisa sobre cobranca de teste interno, isencao ou avaliacao ja cancelada", async () => {
    for (const state of [
      { kind: "internal_test", status: "trialing" },
      { kind: "exempt", status: "trialing" },
      { kind: "commercial", status: "cancelled" },
    ] as const) {
      const db = database({ kind: "trial_reminder" });
      db.setSubscription({ ...state, plan_id: "essencial", trial_ends_at: "2026-11-01T12:00:00Z", paid_until: null });
      const delivered: SubscriptionEmail[] = [];
      const result = await processSubscriptionNotifications({ repository: db.repository, gateway: { send: async (message) => { delivered.push(message); return { id: "unexpected" }; } }, from: "conta@example.test", appUrl: "https://casca.example.test", now: () => now });
      expect(result).toMatchObject({ cancelled: 1, sent: 0 });
      expect(delivered).toEqual([]);
    }
  });

  it("retoma resposta perdida com a mesma mensagem e chave, sem duplicar envio", async () => {
    const db = database();
    const accepted = new Map<string, { id: string; message: SubscriptionEmail }>();
    let loseResponse = true;
    const gateway = { send: async (message: SubscriptionEmail, key: string) => {
      if (!accepted.has(key)) accepted.set(key, { id: "email-a", message });
      if (loseResponse) { loseResponse = false; throw new Error("response lost"); }
      expect(message).toEqual(accepted.get(key)!.message);
      return { id: accepted.get(key)!.id };
    } };
    const deps = { repository: db.repository, gateway, from: "Casca <conta@example.test>", appUrl: "https://casca.example.test", now: () => now };
    expect(await processSubscriptionNotifications(deps)).toMatchObject({ failed: 1 });
    db.setRecipient("endereco-alterado@example.test");
    expect(await processSubscriptionNotifications(deps)).toMatchObject({ sent: 1 });
    expect([...accepted.values()]).toHaveLength(1);
    expect([...accepted.values()][0].message.to).toBe("responsavel@example.test");
  });

  it("encaminha tentativa ambigua com mais de 24h para revisao sem repetir o envio", async () => {
    const db = database({ first_attempt_at: "2026-10-28T11:59:59Z", attempts: 1 });
    const delivered: SubscriptionEmail[] = [];
    const result = await processSubscriptionNotifications({ repository: db.repository, gateway: { send: async (message) => { delivered.push(message); return { id: "unexpected" }; } }, from: "conta@example.test", appUrl: "https://casca.example.test", now: () => now });
    expect(result).toMatchObject({ manualReview: 1, sent: 0 });
    expect(delivered).toEqual([]);
  });

  it("envia lembrete com data e valor antes do termino e descarta prazo antigo", async () => {
    const db = database({ kind: "trial_reminder" });
    const delivered: SubscriptionEmail[] = [];
    const deps = { repository: db.repository, gateway: { send: async (message: SubscriptionEmail) => { delivered.push(message); return { id: "reminder-a" }; } }, from: "conta@example.test", appUrl: "https://casca.example.test", now: () => new Date("2026-10-31T12:00:00Z") };
    expect(await processSubscriptionNotifications(deps)).toMatchObject({ sent: 1 });
    expect(delivered[0].subject).toBe("Sua primeira cobrança do Casca está próxima");
    expect(delivered[0].text).toContain("01/11/2026");
    const stale = database({ kind: "trial_reminder", payload: { planId: "essencial", trialEndsAt: "2026-10-31T12:00:00Z" } });
    expect(await processSubscriptionNotifications({ ...deps, repository: stale.repository })).toMatchObject({ cancelled: 1, sent: 0 });
    expect(delivered).toHaveLength(1);
  });
});
