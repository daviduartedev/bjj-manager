import "server-only";

import { getCurrentAccount } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import { commercialTrialsConfigured, createAbacatePayGateway, readProcessBillingEnvironment } from "./abacatepay";
import { createSubscriptionRepository, SUBSCRIPTION_COLUMNS } from "./repository";
import { createSubscriptionService } from "./service";
import type { SubscriptionActor, SubscriptionRecord } from "./types";

export async function requireProfessorContext(): Promise<SubscriptionActor | null> {
  const context = await getCurrentAccount();
  if (!context || context.profile.role !== "professor" || !context.user.email) return null;
  return { accountId: context.account.id, userId: context.user.id, email: context.user.email, name: context.profile.display_name, role: context.profile.role };
}

export function getSubscriptionService() {
  const client = createAdminClient();
  if (!client) return null;
  try {
    const gateway = createAbacatePayGateway(readProcessBillingEnvironment());
    return createSubscriptionService({ repository: createSubscriptionRepository(client), gateway });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error("billing_configuration_rejected", message.startsWith("billing_") ? message : "billing_configuration_missing");
    return null;
  }
}

export async function getCurrentSubscription() {
  const actor = await requireProfessorContext();
  if (!actor) return null;
  const client = await createClient();
  const admin = createAdminClient();
  const [subscriptionResult, countResult, settingsResult] = await Promise.all([
    client.from("casca_subscriptions").select(SUBSCRIPTION_COLUMNS).eq("account_id", actor.accountId).maybeSingle(),
    client.from("students").select("id", { count: "exact", head: true }).eq("account_id", actor.accountId).eq("status", "active").is("archived_at", null).is("removed_at", null),
    admin ? admin.from("casca_billing_settings").select("enforcement_enabled").eq("id", true).maybeSingle() : Promise.resolve({ data: null, error: { code: "admin_missing" } }),
  ]);
  return {
    actor,
    subscription: (subscriptionResult.data as SubscriptionRecord | null) ?? null,
    activeStudentCount: countResult.count ?? 0,
    enforcementEnabled: !(["42P01", "PGRST205"].includes(settingsResult.error?.code ?? "") || settingsResult.data?.enforcement_enabled === false),
    configured: Boolean(getSubscriptionService()),
    trialsEnabled: commercialTrialsConfigured(readProcessBillingEnvironment()),
    unavailable: Boolean(subscriptionResult.error || countResult.error || (settingsResult.error && !["42P01", "PGRST205"].includes(settingsResult.error.code)) || (!settingsResult.error && typeof settingsResult.data?.enforcement_enabled !== "boolean")),
  };
}
