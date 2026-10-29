import { getSubscriptionPlan } from "@/lib/subscriptions/catalog";

import type { NotificationGateway, NotificationRepository, SubscriptionEmail } from "./types";

export async function processSubscriptionNotifications(deps: {
  repository: NotificationRepository; gateway: NotificationGateway; from: string; appUrl: string;
  now?: () => Date; limit?: number;
}) {
  const now = deps.now?.() ?? new Date();
  const rows = await deps.repository.claim(Math.min(Math.max(deps.limit ?? 10, 1), 25), now);
  const result = { sent: 0, failed: 0, cancelled: 0, manualReview: 0 };
  for (const row of rows) {
    try {
      const firstAttempt = row.first_attempt_at ? Date.parse(row.first_attempt_at) : null;
      if (firstAttempt !== null && (!Number.isFinite(firstAttempt) || now.getTime() - firstAttempt >= 24 * 60 * 60 * 1000 - 120_000)) {
        await deps.repository.fail(row, "idempotency_window_elapsed", now, true);
        result.manualReview += 1;
        continue;
      }
      const subscription = await deps.repository.getSubscription(row.account_id);
      const trialMessage = row.kind === "trial_reminder" || row.kind === "subscription.trial_started";
      if (!subscription || subscription.kind !== "commercial" || (trialMessage && (
        subscription.status !== "trialing" || subscription.trial_ends_at !== row.payload.trialEndsAt ||
        subscription.plan_id !== row.payload.planId || !subscription.trial_ends_at || Date.parse(subscription.trial_ends_at) <= now.getTime()
      ))) {
        await deps.repository.cancel(row);
        result.cancelled += 1;
        continue;
      }
      const recipient = await deps.repository.getRecipient(row.account_id);
      if (!recipient) throw new Error("recipient_missing");
      const plan = getSubscriptionPlan(String(row.payload.planId ?? subscription.plan_id));
      if (!plan) throw new Error("invalid_notification");
      const manageUrl = new URL("/conta/assinatura", deps.appUrl).toString();
      const message = commercialEmail({ kind: row.kind, from: deps.from, to: recipient, planName: plan.name, priceCents: plan.priceCents, payload: row.payload, manageUrl });
      const prepared = await deps.repository.prepare(row, message, now);
      const delivered = await deps.gateway.send(prepared.message, `casca-notification/${row.id}`);
      await deps.repository.sent(row, delivered.id, now);
      result.sent += 1;
    } catch {
      const manualReview = row.attempts >= 8;
      await deps.repository.fail(row, "notification_delivery_failed", new Date(now.getTime() + Math.min(60, 2 ** Math.max(0, row.attempts - 1)) * 60_000), manualReview);
      result.failed += 1;
      if (manualReview) result.manualReview += 1;
    }
  }
  return result;
}

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function dateLabel(value: unknown) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return "a data indicada em Conta";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function commercialEmail(input: {
  kind: string; from: string; to: string; planName: string; priceCents: number;
  payload: Record<string, unknown>; manageUrl: string;
}): SubscriptionEmail {
  const amount = money(typeof input.payload.amountCents === "number" ? input.payload.amountCents : input.priceCents);
  const trialDate = dateLabel(input.payload.trialEndsAt);
  const paidUntil = dateLabel(input.payload.paidUntil);
  const footer = `\n\nGerencie sua assinatura: ${input.manageUrl}`;
  if (input.kind === "trial_reminder") {
    return {
      from: input.from, to: input.to, subject: "Sua primeira cobrança do Casca está próxima",
      text: `A avaliação de três dias do plano ${input.planName} termina em ${trialDate}. A primeira cobrança automática no cartão será de ${money(input.priceCents)}. Se quiser evitar a cobrança, cancele a renovação em Conta antes desse horário.${footer}`,
    };
  }
  if (input.kind === "subscription.completed" || input.kind === "subscription.renewed") {
    return {
      from: input.from, to: input.to, subject: "Pagamento do Casca confirmado",
      text: `Confirmamos o pagamento de ${amount} do plano ${input.planName}. Seu acesso permanece até ${paidUntil}.${footer}`,
    };
  }
  if (input.kind === "subscription.payment_failed") {
    return {
      from: input.from, to: input.to, subject: "Não foi possível cobrar sua assinatura do Casca",
      text: `A cobrança do plano ${input.planName} não foi confirmada. A academia fica em consulta até a regularização. As tentativas automáticas continuam no cartão cadastrado.${footer}`,
    };
  }
  if (input.kind === "subscription.cancelled") {
    return {
      from: input.from, to: input.to, subject: "Renovação do Casca cancelada",
      text: `A renovação automática do plano ${input.planName} foi cancelada. O acesso permanece até o fim do período já pago ou da avaliação.${footer}`,
    };
  }
  if (input.kind === "subscription.plan_changed") {
    return {
      from: input.from, to: input.to, subject: "Seu plano do Casca foi atualizado",
      text: `O plano da sua academia passou a ser ${input.planName} (${money(input.priceCents)} por mês).${footer}`,
    };
  }
  return {
    from: input.from, to: input.to, subject: "Sua avaliação do Casca começou",
    text: `Sua avaliação de três dias do Casca começou. O plano ${input.planName} custa ${money(input.priceCents)} por mês. A primeira cobrança automática no cartão está prevista para ${trialDate}. Você pode cancelar futuras cobranças em Conta.${footer}`,
  };
}
