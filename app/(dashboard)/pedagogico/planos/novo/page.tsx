import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { PlanEditor } from "@/components/lesson-plans/plan-editor";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { getCurrentAccount } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Novo plano pedagógico",
};

export default async function NovoPlanoPage() {
  const ctx = await getCurrentAccount();
  const modality = ctx?.account.modality ?? "jiu_jitsu";
  return (
    <PageFrame
      title="Novo plano"
      emoji="📝"
      icon={BookOpen}
      tone="emerald"
    >
      <div className="space-y-8">
        <DashboardBackLink href={ROUTES.pedagogicoPlanos}>Planos</DashboardBackLink>
        <DashboardPanel icon={BookOpen} title="Editor" subtitle="Cabeçalho, resumo e tópicos do plano">
          <PlanEditor mode={{ kind: "create" }} modality={modality} />
        </DashboardPanel>
      </div>
    </PageFrame>
  );
}
