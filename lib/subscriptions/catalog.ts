/** Capacidade sem teto. Mantém comparações e `Math.min` corretos sem caso especial. */
export const UNLIMITED_ACTIVE_STUDENTS = Number.POSITIVE_INFINITY;

/** Oferta atual, na ordem em que aparece para quem contrata. */
export const OFFERED_SUBSCRIPTION_PLAN_IDS = ["inicial", "academia_100", "ilimitado"] as const;
/** Planos antigos: só quem já assina continua com eles, com preço e limite contratados. */
export const LEGACY_SUBSCRIPTION_PLAN_IDS = ["essencial", "academia", "evolucao"] as const;
export const SUBSCRIPTION_PLAN_IDS = [...OFFERED_SUBSCRIPTION_PLAN_IDS, ...LEGACY_SUBSCRIPTION_PLAN_IDS] as const;

export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLAN_IDS)[number];
export type OfferedSubscriptionPlanId = (typeof OFFERED_SUBSCRIPTION_PLAN_IDS)[number];

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  priceCents: number;
  activeStudentLimit: number;
  offered: boolean;
};

export const ALL_SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  { id: "inicial", name: "Inicial", priceCents: 7990, activeStudentLimit: 50, offered: true },
  { id: "academia_100", name: "Academia", priceCents: 12990, activeStudentLimit: 100, offered: true },
  { id: "ilimitado", name: "Ilimitado", priceCents: 15990, activeStudentLimit: UNLIMITED_ACTIVE_STUDENTS, offered: true },
  { id: "essencial", name: "Essencial", priceCents: 9900, activeStudentLimit: 50, offered: false },
  { id: "academia", name: "Academia", priceCents: 17900, activeStudentLimit: 150, offered: false },
  { id: "evolucao", name: "Evolução", priceCents: 29900, activeStudentLimit: 300, offered: false },
];

/** Planos que landing, cadastro e painel oferecem. */
export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = ALL_SUBSCRIPTION_PLANS.filter((plan) => plan.offered);

export const DEFAULT_SUBSCRIPTION_PLAN_ID: OfferedSubscriptionPlanId = "inicial";

/** Traduz qualquer plano conhecido, inclusive legado. */
export function getSubscriptionPlan(id: string): SubscriptionPlan | null {
  return ALL_SUBSCRIPTION_PLANS.find((plan) => plan.id === id) ?? null;
}

/** Só planos que ainda podem ser contratados. */
export function getOfferedSubscriptionPlan(id: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id) ?? null;
}

export function hasStudentLimit(plan: Pick<SubscriptionPlan, "activeStudentLimit">): boolean {
  return Number.isFinite(plan.activeStudentLimit);
}

export const COMMERCIAL_TRIAL_DAYS = 3;
