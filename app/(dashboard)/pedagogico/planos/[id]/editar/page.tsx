import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { PlanEditor } from "@/components/lesson-plans/plan-editor";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { loadLessonPlanDetail } from "@/lib/data/lesson-plans-page";
import { routePedagogicoPlano } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Editar plano pedagógico",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditarPlanoPage({ params }: PageProps) {
  const { id } = await params;
  const plan = await loadLessonPlanDetail(id);
  if (!plan) notFound();

  return (
    <PageFrame
      title="Editar plano"
      emoji="✏️"
      icon={BookOpen}
      tone="amber"
    >
      <div className="space-y-8">
        <DashboardBackLink href={routePedagogicoPlano(plan.id)}>{plan.title}</DashboardBackLink>
        <DashboardPanel icon={BookOpen} title="Editor" subtitle="Cabeçalho, resumo e tópicos do plano">
        <PlanEditor
          mode={{
            kind: "edit",
            lessonPlanId: plan.id,
            canPublish: plan.status === "draft",
          }}
          initial={{
            planKind: plan.plan_kind,
            referenceMonth: plan.reference_month,
            title: plan.title,
            internalNotes: plan.internal_notes,
            content: plan.current_revision?.content_json ?? { topics: [], summary: null },
          }}
        />
      </DashboardPanel>
      </div>
    </PageFrame>
  );
}
