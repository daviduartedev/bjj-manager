import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, FileDown } from "lucide-react";

import { PlanStatusSwitcher } from "@/components/lesson-plans/plan-status-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { loadLessonPlanDetail } from "@/lib/data/lesson-plans-page";
import { formatDateTimeBR } from "@/lib/documents/formatters";
import { planKindLabels } from "@/lib/i18n/domain-enums";
import { ROUTES, routePedagogicoPlanoEditar } from "@/lib/routes";

import { PlanDetailActions } from "./detail-actions";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const plan = await loadLessonPlanDetail(id);
  return { title: plan ? plan.title : "Plano pedagógico" };
}

export default async function PlanoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const plan = await loadLessonPlanDetail(id);
  if (!plan) notFound();

  const content = plan.current_revision?.content_json ?? { topics: [], summary: null };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DashboardPageHero
        badge="Pedagógico"
        intro={<DashboardBackLink href={ROUTES.pedagogicoPlanos}>Planos</DashboardBackLink>}
        title={plan.title}
        description={`${planKindLabels[plan.plan_kind]} · ${plan.reference_month}`}
      />

      <DashboardPanel
        icon={BookOpen}
        title="Detalhes"
        subtitle={`Estado actual e histórico (${plan.revisions.length} revisões)`}
      >
        <PlanStatusSwitcher planId={plan.id} status={plan.status} />

        {plan.current_revision ? (
          <p className="mt-3 text-crm-xs text-muted-foreground">
            Revisão actual: #{plan.current_revision.revision_number}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="min-h-11">
            <Link href={routePedagogicoPlanoEditar(plan.id)}>Editar / nova revisão</Link>
          </Button>
          <PlanDetailActions
            planId={plan.id}
            status={plan.status}
            referenceMonth={plan.reference_month}
            planKind={plan.plan_kind}
            title={plan.title}
          />
        </div>

        {content.summary ? (
          <p className="mt-6 text-crm-sm text-muted-foreground">{content.summary}</p>
        ) : null}

        <div className="mt-6 space-y-4">
          {content.topics.length === 0 ? (
            <p className="text-crm-sm text-muted-foreground">Plano ainda sem tópicos.</p>
          ) : (
            content.topics.map((topic) => (
              <Card key={topic.id} className="border-border bg-card shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-base font-semibold">{topic.title}</h3>
                  {topic.summary ? (
                    <p className="text-crm-sm text-muted-foreground">{topic.summary}</p>
                  ) : null}
                  {topic.items.length > 0 ? (
                    <ul className="ml-5 list-disc space-y-1 text-crm-sm">
                      {topic.items.map((it) => (
                        <li key={it.id}>{it.text}</li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DashboardPanel>

      <DashboardPanel icon={FileDown} title="Histórico" subtitle="Todas as revisões">
        <div className="space-y-2">
          {plan.revisions.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card/50 p-3"
            >
              <div>
                <p className="text-crm-sm font-medium">Revisão #{rev.revision_number}</p>
                <p className="text-crm-xs text-muted-foreground">
                  {formatDateTimeBR(rev.created_at)}
                </p>
              </div>
              {rev.change_summary ? (
                <span className="text-crm-xs text-muted-foreground">{rev.change_summary}</span>
              ) : null}
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}
