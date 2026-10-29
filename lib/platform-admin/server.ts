import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAbacatePayGateway, readProcessBillingEnvironment } from "@/lib/subscriptions/abacatepay";
import { createPlatformAdminService, isPlatformOwner, type AdminOverview, type AdminSubscription, type InternalAcademyRequest, type PlatformAdminDependencies } from "./service";

export async function getPlatformAdminUser() {
  const user = await getCurrentUser();
  return user && isPlatformOwner(user.id, process.env.CASCA_PLATFORM_ADMIN_USER_ID) ? user : null;
}

function adminRepository(client: SupabaseClient): PlatformAdminDependencies["repository"] {
  return {
    async overview(page) {
      const { data, error } = await client.rpc("casca_admin_overview", { p_page: page });
      if (error || !data) throw new Error("platform_overview_unavailable");
      return data as AdminOverview;
    },
    async getSubscription(accountId) {
      const { data, error } = await client.from("casca_subscriptions").select("kind,plan_id,provider_subscription_id,provider_checkout_id,version").eq("account_id", accountId).maybeSingle();
      if (error) throw new Error("platform_subscription_unavailable");
      return data as AdminSubscription | null;
    },
    async changeKind(input) {
      const { error } = await client.rpc("casca_admin_change_kind", { p_account_id: input.accountId, p_actor_user_id: input.actorUserId, p_kind: input.kind, p_plan_id: input.planId, p_reason: input.reason, p_expected_version: input.expectedVersion ?? 0 });
      if (error) throw new Error("platform_change_failed");
    },
    async reserveInternal(input) {
      const { data, error } = await client.rpc("casca_admin_reserve_internal", { p_id: input.requestId, p_actor_user_id: input.actorUserId, p_academy_name: input.academyName, p_email: input.email, p_modality: input.modality, p_plan_id: input.planId });
      if (error || !data) throw new Error("internal_reservation_failed");
      return data as InternalAcademyRequest;
    },
    async linkInternalUser(requestId, userId) {
      const { error } = await client.rpc("casca_admin_link_internal_user", { p_request_id: requestId, p_user_id: userId });
      if (error) throw new Error("internal_link_failed");
    },
    async completeInternal(requestId) {
      const { data, error } = await client.rpc("casca_admin_complete_internal", { p_request_id: requestId });
      if (error || typeof data !== "string") throw new Error("internal_provisioning_failed");
      return data;
    },
  };
}

async function ownedInternalAuthUser(client: SupabaseClient, email: string, requestId: string): Promise<string | null> {
  const { data, error } = await client.rpc("casca_admin_find_internal_auth_user", { p_email: email, p_request_id: requestId });
  if (error) throw new Error("internal_auth_lookup_failed");
  if (!data) return null;
  if (data.owned !== true || typeof data.id !== "string") throw new Error("internal_email_already_used");
  return data.id;
}

export function getPlatformAdminService() {
  const client = createAdminClient();
  if (!client) return null;

  async function stopBilling(subscriptionId: string | null, checkoutId?: string | null) {
    const gateway = createAbacatePayGateway(readProcessBillingEnvironment());
    if (checkoutId) await gateway.deleteSubscriptionCheckout(checkoutId);
    const subscriptions = checkoutId ? await gateway.listSubscriptionsByCheckout(checkoutId) : [];
    const ids = new Set(subscriptions.filter(subscription => subscription.status === "ACTIVE").map(subscription => subscription.id));
    if (subscriptionId) {
      const subscription = await gateway.getSubscription(subscriptionId);
      if (subscription.status === "ACTIVE") ids.add(subscription.id);
    }
    for (const id of ids) await gateway.cancelSubscription(id);
  }

  return createPlatformAdminService({
    ownerUserId: process.env.CASCA_PLATFORM_ADMIN_USER_ID,
    repository: adminRepository(client),
    cancelRecurring: stopBilling,
    cancelPendingCheckout: checkoutId => stopBilling(null, checkoutId),
    async createInternalUser(input) {
      const previous = await ownedInternalAuthUser(client, input.email, input.requestId);
      if (previous) return previous;
      try {
        const { data, error } = await client.auth.admin.createUser({
          email: input.email, password: input.password, email_confirm: true,
          app_metadata: { casca_internal_request: input.requestId },
        });
        if (error || !data.user) throw new Error("internal_auth_create_failed");
        return data.user.id;
      } catch {
        // Uma resposta perdida nao permite criar/reutilizar outra identidade por e-mail.
        const reconciled = await ownedInternalAuthUser(client, input.email, input.requestId);
        if (reconciled) return reconciled;
        throw new Error("internal_auth_creation_uncertain");
      }
    },
  });
}
