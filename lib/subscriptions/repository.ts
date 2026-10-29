import type { SupabaseClient } from "@supabase/supabase-js";

import type { CheckoutOperation, SubscriptionRecord, SubscriptionRepository } from "./types";

export const SUBSCRIPTION_COLUMNS = "account_id,kind,status,plan_id,provider_customer_id,provider_checkout_id,provider_checkout_url,provider_subscription_id,trial_used,trial_ends_at,current_period_start,paid_until,pending_plan_id,pending_plan_at,last_event_at,version,created_at,updated_at";
const OPERATION_COLUMNS = "id,account_id,kind,plan_id,status,amount_cents,provider_checkout_id,provider_checkout_url,provider_update_id";

function asOperation(data: unknown): CheckoutOperation {
  return data as CheckoutOperation;
}

export function createSubscriptionRepository(client: SupabaseClient): SubscriptionRepository {
  return {
    async get(accountId) {
      const { data, error } = await client.from("casca_subscriptions").select(SUBSCRIPTION_COLUMNS).eq("account_id", accountId).maybeSingle();
      if (error) throw new Error("subscription_read_failed");
      return data as SubscriptionRecord | null;
    },
    async countActiveStudents(accountId) {
      const { count, error } = await client.from("students").select("id", { count: "exact", head: true }).eq("account_id", accountId).eq("status", "active").is("archived_at", null).is("removed_at", null);
      if (error) throw new Error("subscription_read_failed");
      return count ?? 0;
    },
    async reserveCheckout(accountId, planId, expectedVersion) {
      const { data, error } = await client.rpc("casca_reserve_checkout", { p_account_id: accountId, p_plan_id: planId, p_expected_version: expectedVersion });
      if (error || !data?.operation) throw new Error("subscription_reservation_failed");
      return data as { operation: CheckoutOperation; reserved: boolean };
    },
    async completeCheckout(operationId, customerId, checkout) {
      const { error } = await client.rpc("casca_complete_checkout", { p_operation_id: operationId, p_customer_id: customerId, p_checkout_id: checkout.id, p_checkout_url: checkout.url });
      if (error) throw new Error("subscription_checkout_save_failed");
    },
    async findByProvider(subscriptionId, checkoutId) {
      const bySubscription = await client.from("casca_subscriptions").select(SUBSCRIPTION_COLUMNS).eq("provider_subscription_id", subscriptionId).maybeSingle();
      if (bySubscription.error) throw new Error("subscription_read_failed");
      if (bySubscription.data) return bySubscription.data as SubscriptionRecord;
      if (!checkoutId) return null;
      const byCheckout = await client.from("casca_subscriptions").select(SUBSCRIPTION_COLUMNS).eq("provider_checkout_id", checkoutId).maybeSingle();
      if (byCheckout.error) throw new Error("subscription_read_failed");
      return byCheckout.data as SubscriptionRecord | null;
    },
    async findByCheckout(checkoutId) {
      const direct = await client.from("casca_subscriptions").select(SUBSCRIPTION_COLUMNS).eq("provider_checkout_id", checkoutId).maybeSingle();
      if (direct.error) throw new Error("subscription_read_failed");
      if (direct.data) return direct.data as SubscriptionRecord;
      const payment = await client.from("casca_subscription_payments").select("account_id").eq("provider_checkout_id", checkoutId).limit(1).maybeSingle();
      if (payment.error) throw new Error("subscription_read_failed");
      if (!payment.data) return null;
      const subscription = await client.from("casca_subscriptions").select(SUBSCRIPTION_COLUMNS).eq("account_id", payment.data.account_id).maybeSingle();
      if (subscription.error) throw new Error("subscription_read_failed");
      return subscription.data as SubscriptionRecord | null;
    },
    async applyEvent(change) {
      const { data, error } = await client.rpc("casca_apply_subscription_event", { p_change: change });
      if (error || !["applied", "duplicate", "stale"].includes(data)) throw new Error("subscription_event_save_failed");
      return data as "applied" | "duplicate" | "stale";
    },
    async reserveOperation(input) {
      const { data, error } = await client.rpc("casca_reserve_operation", {
        p_account_id: input.accountId, p_kind: input.kind, p_plan_id: input.planId,
        p_amount_cents: input.amountCents, p_expected_version: input.expectedVersion,
      });
      if (error || !data?.operation) throw new Error("subscription_reservation_failed");
      return data as { operation: CheckoutOperation; reserved: boolean };
    },
    async completeOperation(input) {
      const { error } = await client.rpc("casca_complete_operation", {
        p_operation_id: input.operationId,
        p_checkout_id: input.checkout?.id ?? null,
        p_checkout_url: input.checkout?.url ?? null,
        p_provider_update_id: input.providerUpdateId ?? null,
        p_status: input.status ?? "ready",
      });
      if (error) throw new Error("subscription_operation_save_failed");
    },
    async getOperation(operationId) {
      const { data, error } = await client.from("casca_subscription_operations").select(OPERATION_COLUMNS).eq("id", operationId).maybeSingle();
      if (error) throw new Error("subscription_read_failed");
      return data ? asOperation(data) : null;
    },
    async findOperationByCheckout(checkoutId) {
      const { data, error } = await client.from("casca_subscription_operations").select(OPERATION_COLUMNS).eq("provider_checkout_id", checkoutId).maybeSingle();
      if (error) throw new Error("subscription_read_failed");
      return data ? asOperation(data) : null;
    },
    async applyUpgrade(input) {
      const { data, error } = await client.rpc("casca_apply_upgrade", { p_change: input });
      if (error || !["applied", "duplicate"].includes(data)) throw new Error("subscription_event_save_failed");
      return data as "applied" | "duplicate";
    },
    async schedulePlanChange(input) {
      const { error } = await client.rpc("casca_schedule_plan_change", {
        p_account_id: input.accountId, p_plan_id: input.planId, p_at: input.at, p_expected_version: input.expectedVersion,
      });
      if (error) throw new Error("subscription_plan_change_failed");
    },
    async applyImmediatePlan(input) {
      const { error } = await client.rpc("casca_apply_immediate_plan", {
        p_account_id: input.accountId, p_plan_id: input.planId, p_expected_version: input.expectedVersion,
      });
      if (error) throw new Error("subscription_plan_change_failed");
    },
    async cancelRenewal(accountId, expectedVersion) {
      const { error } = await client.rpc("casca_cancel_renewal", { p_account_id: accountId, p_expected_version: expectedVersion });
      if (error) throw new Error("subscription_cancel_failed");
    },
  };
}
