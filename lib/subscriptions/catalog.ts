export const SUBSCRIPTION_PLANS = [
  { id: "essencial", name: "Essencial", priceCents: 9900, activeStudentLimit: 50 },
  { id: "academia", name: "Academia", priceCents: 17900, activeStudentLimit: 150 },
  { id: "evolucao", name: "Evolução", priceCents: 29900, activeStudentLimit: 300 },
] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];
export type SubscriptionPlanId = SubscriptionPlan["id"];

export function getSubscriptionPlan(id: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id) ?? null;
}

export const COMMERCIAL_TRIAL_DAYS = 3;
