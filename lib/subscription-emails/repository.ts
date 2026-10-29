import type { SupabaseClient } from "@supabase/supabase-js";

import type { Notification, NotificationRepository, SubscriptionEmail } from "./types";

function asNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    account_id: String(row.account_id),
    kind: String(row.kind),
    payload: (row.payload as Record<string, unknown>) ?? {},
    status: row.status as Notification["status"],
    attempts: Number(row.attempts ?? 0),
    first_attempt_at: (row.first_attempt_at as string | null) ?? null,
    delivery_json: (row.delivery_json as SubscriptionEmail | null) ?? null,
    claim_token: String(row.claim_token ?? ""),
    provider_email_id: (row.provider_email_id as string | null) ?? null,
    manual_review: row.manual_review === true,
  };
}

export function createNotificationRepository(client: SupabaseClient): NotificationRepository {
  return {
    async claim(limit, now) {
      const { data, error } = await client.rpc("casca_claim_notifications", { p_limit: limit, p_now: now.toISOString() });
      if (error) throw new Error("notification_claim_failed");
      return Array.isArray(data) ? data.map((row) => asNotification(row as Record<string, unknown>)) : [];
    },
    async getSubscription(accountId) {
      const { data, error } = await client.from("casca_subscriptions").select("kind,status,plan_id,trial_ends_at,paid_until").eq("account_id", accountId).maybeSingle();
      if (error) throw new Error("subscription_read_failed");
      return data;
    },
    async getRecipient(accountId) {
      const profile = await client.from("profiles").select("user_id").eq("account_id", accountId).eq("role", "professor").maybeSingle();
      if (profile.error || !profile.data?.user_id) return null;
      const { data, error } = await client.auth.admin.getUserById(profile.data.user_id);
      if (error) throw new Error("recipient_lookup_failed");
      return data.user.email ?? null;
    },
    async prepare(notification, message, now) {
      const { data, error } = await client.rpc("casca_prepare_notification", {
        p_id: notification.id, p_token: notification.claim_token, p_message: message, p_now: now.toISOString(),
      });
      if (error || !data) throw new Error("notification_prepare_failed");
      const stored = asNotification(data as Record<string, unknown>);
      if (!stored.delivery_json || !stored.first_attempt_at) throw new Error("notification_prepare_failed");
      return { message: stored.delivery_json, firstAttemptAt: stored.first_attempt_at };
    },
    async sent(notification, providerId, now) {
      const { error } = await client.rpc("casca_finish_notification", {
        p_id: notification.id, p_token: notification.claim_token, p_status: "sent", p_provider_id: providerId,
        p_error: null, p_retry_at: null, p_manual: false, p_now: now.toISOString(),
      });
      if (error) throw new Error("notification_finish_failed");
    },
    async cancel(notification) {
      const { error } = await client.rpc("casca_finish_notification", {
        p_id: notification.id, p_token: notification.claim_token, p_status: "cancelled", p_provider_id: null,
        p_error: null, p_retry_at: null, p_manual: false, p_now: new Date().toISOString(),
      });
      if (error) throw new Error("notification_finish_failed");
    },
    async fail(notification, code, retryAt, manualReview) {
      const { error } = await client.rpc("casca_finish_notification", {
        p_id: notification.id, p_token: notification.claim_token, p_status: "failed", p_provider_id: null,
        p_error: code, p_retry_at: retryAt.toISOString(), p_manual: manualReview, p_now: new Date().toISOString(),
      });
      if (error) throw new Error("notification_finish_failed");
    },
  };
}
