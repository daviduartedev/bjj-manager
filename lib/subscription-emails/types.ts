import type { SubscriptionRecord } from "@/lib/subscriptions/types";

export type SubscriptionEmail = { from: string; to: string; subject: string; text: string };
export type Notification = {
  id: string; event_id: string; account_id: string; kind: string;
  payload: Record<string, unknown>; status: "pending" | "sent" | "failed" | "cancelled";
  attempts: number; first_attempt_at: string | null; delivery_json: SubscriptionEmail | null;
  claim_token: string; provider_email_id: string | null; manual_review: boolean;
};
export type CommercialEmailSubscription = Pick<SubscriptionRecord, "kind" | "status" | "plan_id" | "trial_ends_at" | "paid_until">;

export interface NotificationRepository {
  claim(limit: number, now: Date): Promise<Notification[]>;
  getSubscription(accountId: string): Promise<CommercialEmailSubscription | null>;
  getRecipient(accountId: string): Promise<string | null>;
  prepare(notification: Notification, message: SubscriptionEmail, now: Date): Promise<{ message: SubscriptionEmail; firstAttemptAt: string }>;
  sent(notification: Notification, providerId: string, now: Date): Promise<void>;
  cancel(notification: Notification): Promise<void>;
  fail(notification: Notification, code: string, retryAt: Date, manualReview: boolean): Promise<void>;
}

export interface NotificationGateway {
  send(message: SubscriptionEmail, idempotencyKey: string): Promise<{ id: string }>;
}
