import type { SubscriptionPlanId } from "./catalog";

export type { SubscriptionPlanId } from "./catalog";
export type SubscriptionKind = "commercial" | "internal_test" | "exempt";
export type SubscriptionStatus = "pending" | "trialing" | "active" | "past_due" | "cancelled";

export type SubscriptionRecord = {
  account_id: string;
  kind: SubscriptionKind;
  status: SubscriptionStatus;
  plan_id: SubscriptionPlanId;
  provider_customer_id: string | null;
  provider_checkout_id: string | null;
  provider_checkout_url: string | null;
  provider_subscription_id: string | null;
  trial_used: boolean;
  trial_ends_at: string | null;
  current_period_start: string | null;
  paid_until: string | null;
  pending_plan_id: SubscriptionPlanId | null;
  pending_plan_at: string | null;
  last_event_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

export type SubscriptionActor = { accountId: string; userId: string; email: string; name: string; role: "professor" | "student" };
export type SubscriptionResult<T> = { ok: true; data: T } | { ok: false; error: string };
export type OperationKind = "checkout" | "upgrade" | "downgrade" | "cancel";
export type CheckoutOperation = {
  id: string;
  account_id: string;
  kind: OperationKind;
  plan_id: SubscriptionPlanId;
  status: "creating" | "ready" | "paid" | "failed" | "completed";
  amount_cents: number | null;
  provider_checkout_id: string | null;
  provider_checkout_url: string | null;
  provider_update_id: string | null;
};

export type PlanChangeQuote = {
  currentPlanId: SubscriptionPlanId;
  targetPlanId: SubscriptionPlanId;
  kind: "upgrade" | "downgrade";
  amountCents: number;
  appliesAt: string | null;
  immediate: boolean;
  targetLimit: number;
  activeStudentCount: number;
};

export type ProviderCheckout = {
  id: string;
  amount: number;
  paidAmount: number | null;
  customerId: string | null;
  externalId: string | null;
  status: string;
  frequency: string | null;
  devMode: boolean;
  updatedAt: string;
};

export type ProviderPlanChange = {
  id: string;
  subscriptionId: string;
  productId: string;
  newAmount: number;
  status: string;
};

export type ProviderSubscription = {
  id: string;
  checkoutId: string | null;
  customerId: string;
  amount: number;
  status: "PENDING" | "ACTIVE" | "CANCELLED";
  method: "CARD" | "PIX";
  devMode: boolean;
  trialDays: number | null;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionEventChange = {
  eventId: string;
  eventName: string;
  accountId: string;
  occurredAt: string;
  providerSubscriptionId: string;
  providerCheckoutId: string | null;
  providerCustomerId: string;
  status: SubscriptionStatus;
  planId: SubscriptionPlanId;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  paidUntil: string | null;
  paymentId: string | null;
  paymentAmount: number | null;
  receiptUrl: string | null;
  revokeAccess?: boolean;
};

export interface SubscriptionRepository {
  get(accountId: string): Promise<SubscriptionRecord | null>;
  countActiveStudents(accountId: string): Promise<number>;
  reserveCheckout(accountId: string, planId: SubscriptionPlanId, expectedVersion: number): Promise<{ operation: CheckoutOperation; reserved: boolean }>;
  completeCheckout(operationId: string, customerId: string, checkout: { id: string; url: string }): Promise<void>;
  findByProvider(subscriptionId: string, checkoutId: string | null): Promise<SubscriptionRecord | null>;
  findByCheckout(checkoutId: string): Promise<SubscriptionRecord | null>;
  applyEvent(change: SubscriptionEventChange): Promise<"applied" | "duplicate" | "stale">;
  reserveOperation(input: { accountId: string; kind: Exclude<OperationKind, "checkout">; planId: SubscriptionPlanId; amountCents: number | null; expectedVersion: number }): Promise<{ operation: CheckoutOperation; reserved: boolean }>;
  completeOperation(input: { operationId: string; checkout?: { id: string; url: string } | null; providerUpdateId?: string | null; status?: "ready" | "paid" | "completed" }): Promise<void>;
  getOperation(operationId: string): Promise<CheckoutOperation | null>;
  findOperationByCheckout(checkoutId: string): Promise<CheckoutOperation | null>;
  applyUpgrade(input: { accountId: string; planId: SubscriptionPlanId; checkoutId: string; paymentId: string; amountCents: number; occurredAt: string; receiptUrl: string | null }): Promise<"applied" | "duplicate">;
  schedulePlanChange(input: { accountId: string; planId: SubscriptionPlanId; at: string; expectedVersion: number }): Promise<void>;
  applyImmediatePlan(input: { accountId: string; planId: SubscriptionPlanId; expectedVersion: number }): Promise<void>;
  cancelRenewal(accountId: string, expectedVersion: number): Promise<void>;
}

export interface SubscriptionGateway {
  readonly devMode: boolean;
  createCustomer(input: { email: string; name: string }): Promise<{ id: string }>;
  createCheckout(input: { operationId: string; planId: SubscriptionPlanId; customerId: string; trial: boolean }): Promise<{ id: string; url: string }>;
  getSubscription(id: string): Promise<ProviderSubscription>;
  findCheckoutByOperation?(input: { operationId: string; planId: SubscriptionPlanId; trial: boolean; customerId: string | null }): Promise<{ id: string; url: string; customerId: string } | null>;
  createOneOffCheckout?(input: { operationId: string; amountCents: number; customerId: string }): Promise<{ id: string; url: string }>;
  findOneOffCheckoutByOperation?(input: { operationId: string; amountCents: number; customerId: string }): Promise<{ id: string; url: string; customerId: string } | null>;
  getCheckout?(id: string): Promise<ProviderCheckout>;
  changePlan?(input: { subscriptionId: string; planId: SubscriptionPlanId }): Promise<ProviderPlanChange>;
  cancelSubscription?(id: string): Promise<void>;
}
