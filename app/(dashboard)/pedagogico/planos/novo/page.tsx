import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { PlanEditor } from "@/components/lesson-plans/plan-editor";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Novo plano pedagógico",
};

export default function NovoPlanoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DashboardPageHero
        badge="Pedagógico"
        intro={<DashboardBackLink href={ROUTES.pedagogicoPlanos}>Planos</DashboardBackLink>}
        title="Novo plano pedagógico"
        description="Comece pelo título e tipo. Os tópicos podem ser ajustados depois."
      />
      <DashboardPanel icon={BookOpen} title="Editor" subtitle="Cabeçalho, resumo e tópicos do plano">
        <PlanEditor mode={{ kind: "create" }} />
      </DashboardPanel>
    </div>
  );
}
