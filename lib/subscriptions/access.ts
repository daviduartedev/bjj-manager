import type { SubscriptionRecord } from "./types";
import { getSubscriptionPlan } from "./catalog";

export type SubscriptionAccess = {
  canWrite: boolean;
  reason: "disabled" | "missing" | "pending" | "trialing" | "active" | "paid_period" | "internal_test" | "exempt" | "expired";
  activeStudentLimit: number | null;
};

/** A ativacao comercial e deliberada: preparar migrations nao interrompe clientes existentes. */
export function getSubscriptionAccess(
  subscription: SubscriptionRecord | null,
  now: Date,
  enforcementEnabled: boolean,
): SubscriptionAccess {
  if (!enforcementEnabled) return { canWrite: true, reason: "disabled", activeStudentLimit: null };
  if (!subscription) return { canWrite: false, reason: "missing", activeStudentLimit: null };
  const currentLimit = getSubscriptionPlan(subscription.plan_id)?.activeStudentLimit ?? null;
  const pendingLimit = subscription.pending_plan_id ? getSubscriptionPlan(subscription.pending_plan_id)?.activeStudentLimit : null;
  const activeStudentLimit = currentLimit === null ? null : Math.min(currentLimit, pendingLimit ?? currentLimit);
  if (subscription.kind === "internal_test" || subscription.kind === "exempt") {
    return { canWrite: true, reason: subscription.kind, activeStudentLimit };
  }
  if (["active", "cancelled", "past_due"].includes(subscription.status)) {
    const paid = Boolean(subscription.paid_until && Date.parse(subscription.paid_until) > now.getTime());
    const trial = Boolean(subscription.trial_ends_at && Date.parse(subscription.trial_ends_at) > now.getTime());
    const canWrite = paid || (subscription.status === "cancelled" && trial);
    return { canWrite, reason: canWrite ? (subscription.status === "active" ? "active" : paid ? "paid_period" : "trialing") : "expired", activeStudentLimit };
  }
  if (subscription.status === "trialing") {
    const canWrite = Boolean(subscription.trial_ends_at && Date.parse(subscription.trial_ends_at) > now.getTime());
    return { canWrite, reason: canWrite ? "trialing" : "expired", activeStudentLimit };
  }
  return { canWrite: false, reason: "pending", activeStudentLimit };
}
