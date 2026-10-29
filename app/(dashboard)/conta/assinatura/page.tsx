import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { SubscriptionPanel } from "@/components/subscriptions/subscription-panel";
import { getCurrentSubscription } from "@/lib/subscriptions/server";

export const metadata: Metadata = { title: "Assinatura do Casca" };

export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ contratacao?: string | string[] }> }) {
  const data = await getCurrentSubscription();
  if (!data) redirect("/login");
  const params = await searchParams;
  const token = Array.isArray(params.contratacao) ? params.contratacao[0] : params.contratacao;
  return <PageFrame title="Assinatura do Casca" emoji="" icon={CreditCard} context="Plano e contratação da sua academia" tone="sky"><SubscriptionPanel subscription={data.subscription} activeStudentCount={data.activeStudentCount} configured={data.configured} unavailable={data.unavailable} checkoutReceived={token === "recebida"} /></PageFrame>;
}
