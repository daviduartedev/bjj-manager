import type { Metadata } from "next";

import { RegisterForm } from "./register-form";
import { getSubscriptionPlan } from "@/lib/subscriptions/catalog";

export const metadata: Metadata = {
  title: "Criar academia",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plano?: string | string[] }> }) {
  const params = await searchParams;
  const plan = typeof params.plano === "string" ? getSubscriptionPlan(params.plano) : null;
  return <RegisterForm initialPlanId={plan?.id ?? "essencial"} />;
}
