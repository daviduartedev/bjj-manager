import type { SupabaseClient } from "@supabase/supabase-js";

import { getSubscriptionAccess, type SubscriptionAccess } from "./access";
import type { SubscriptionRecord } from "./types";

export const SUBSCRIPTION_READ_ONLY_MESSAGE = "Sua academia está em somente leitura. Regularize a assinatura em Conta para voltar a fazer alterações.";
export const SUBSCRIPTION_CAPACITY_MESSAGE = "O limite de alunos ativos foi atingido. Altere o plano em Conta para cadastrar ou reativar alunos.";

export type AcademyAccess = { access: SubscriptionAccess; subscription: SubscriptionRecord | null; enforcementEnabled: boolean };

/** Ausencia da migration e uma transicao explicita; erros operacionais nao liberam escrita. */
export async function getAcademyAccess(
  client: SupabaseClient,
  accountId?: string,
  now = new Date(),
): Promise<AcademyAccess> {
  const settings = await client.from("casca_billing_settings").select("enforcement_enabled").eq("id", true).maybeSingle();
  if (settings.error) {
    if (["42P01", "PGRST205"].includes(settings.error.code)) {
      return { access: getSubscriptionAccess(null, now, false), subscription: null, enforcementEnabled: false };
    }
    throw new Error("Não foi possível verificar a assinatura. Tente novamente.");
  }
  if (typeof settings.data?.enforcement_enabled !== "boolean") {
    throw new Error("Não foi possível verificar a assinatura. Tente novamente.");
  }
  if (settings.data.enforcement_enabled === false) {
    return { access: getSubscriptionAccess(null, now, false), subscription: null, enforcementEnabled: false };
  }
  let resolvedAccountId = accountId;
  if (!resolvedAccountId) {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Sessão inválida.");
    const profile = await client.from("profiles").select("account_id").eq("user_id", user.id).maybeSingle();
    if (profile.error || !profile.data?.account_id) throw new Error("Conta não encontrada.");
    resolvedAccountId = profile.data.account_id as string;
  }
  const columns = "account_id,kind,status,plan_id,provider_customer_id,provider_checkout_id,provider_checkout_url,provider_subscription_id,trial_used,trial_ends_at,current_period_start,paid_until,pending_plan_id,pending_plan_at,last_event_at,version,created_at,updated_at";
  const row = await client.from("casca_subscriptions").select(columns).eq("account_id", resolvedAccountId).maybeSingle();
  if (row.error) throw new Error("Não foi possível verificar a assinatura. Tente novamente.");
  const subscription = row.data as SubscriptionRecord | null;
  return { access: getSubscriptionAccess(subscription, now, true), subscription, enforcementEnabled: true };
}

export async function requireAcademyWriteAccess(
  client: SupabaseClient,
  accountId?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { access } = await getAcademyAccess(client, accountId);
    return access.canWrite ? { ok: true } : { ok: false, error: SUBSCRIPTION_READ_ONLY_MESSAGE };
  } catch {
    return { ok: false, error: "Não foi possível verificar a assinatura. Tente novamente." };
  }
}
