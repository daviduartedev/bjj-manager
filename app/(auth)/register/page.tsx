import type { Metadata } from "next";

import { RegisterForm } from "./register-form";
import { DEFAULT_SUBSCRIPTION_PLAN_ID, OFFERED_SUBSCRIPTION_PLAN_IDS, type OfferedSubscriptionPlanId } from "@/lib/subscriptions/catalog";
import { commercialTrialsConfigured, readProcessBillingEnvironment } from "@/lib/subscriptions/abacatepay";

export const metadata: Metadata = {
  title: "Criar academia",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plano?: string | string[] }> }) {
  const params = await searchParams;
  // Link antigo (plano legado) ou desconhecido cai no plano inicial.
  const requested = typeof params.plano === "string" ? params.plano : null;
  const initialPlanId = OFFERED_SUBSCRIPTION_PLAN_IDS.find((id): id is OfferedSubscriptionPlanId => id === requested) ?? DEFAULT_SUBSCRIPTION_PLAN_ID;
  return <RegisterForm initialPlanId={initialPlanId} trialsEnabled={commercialTrialsConfigured(readProcessBillingEnvironment())} />;
}
