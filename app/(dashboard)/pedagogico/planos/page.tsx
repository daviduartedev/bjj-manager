import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { PlansList } from "@/components/lesson-plans/plans-list";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { loadLessonPlansList } from "@/lib/data/lesson-plans-page";

export const metadata: Metadata = {
  title: "Planos pedagógicos",
};

type SearchParams = Promise<{ kind?: string; status?: string; mes?: string }>;

const KIND_VALUES = ["adult", "kids_1", "kids_2"] as const;
const STATUS_VALUES = ["draft", "published", "archived"] as const;
const MONTH_RE = /^\d{4}-\d{2}$/;

export default async function PlanosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const planKind = params.kind && (KIND_VALUES as readonly string[]).includes(params.kind)
    ? (params.kind as (typeof KIND_VALUES)[number])
    : undefined;
  const status = params.status && (STATUS_VALUES as readonly string[]).includes(params.status)
    ? (params.status as (typeof STATUS_VALUES)[number])
    : undefined;
  const referenceMonth = params.mes && MONTH_RE.test(params.mes) ? params.mes : undefined;

  const { rows } = await loadLessonPlansList({ planKind, status, referenceMonth });

  return (
    <PageFrame
      title="Planos de aula"
      emoji="📖"
      icon={BookOpen}
      tone="violet"
    >
      <div data-tour="page-pedagogico-planos">
        <DashboardPanel
          icon={BookOpen}
          title="Planos"
        >
          <PlansList rows={rows} />
        </DashboardPanel>
      </div>
    </PageFrame>
  );
}
