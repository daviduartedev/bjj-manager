"use server";

import { getSubscriptionService, requireProfessorContext } from "@/lib/subscriptions/server";

async function withService() {
  const actor = await requireProfessorContext();
  if (!actor) return { actor: null, service: null, error: "Entre como responsável pela academia para gerenciar sua assinatura." } as const;
  const service = getSubscriptionService();
  if (!service) return { actor, service: null, error: "A contratação ainda está sendo preparada. Entre em contato com o Casca." } as const;
  return { actor, service, error: null } as const;
}

export async function startSubscriptionCheckout(input: unknown) {
  const context = await withService();
  if (!context.service) return { ok: false as const, error: context.error };
  return context.service.startCheckout(context.actor, input);
}

export async function quoteSubscriptionPlanChange(input: unknown) {
  const context = await withService();
  if (!context.service) return { ok: false as const, error: context.error };
  return context.service.quotePlanChange(context.actor, input);
}

export async function startSubscriptionPlanChange(input: unknown) {
  const context = await withService();
  if (!context.service) return { ok: false as const, error: context.error };
  return context.service.startPlanChange(context.actor, input);
}

export async function cancelSubscriptionRenewal() {
  const context = await withService();
  if (!context.service) return { ok: false as const, error: context.error };
  return context.service.cancelRenewal(context.actor);
}
