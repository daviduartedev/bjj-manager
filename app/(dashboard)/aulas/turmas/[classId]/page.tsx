import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Users } from "lucide-react";

import { ClassEnrollmentsPanel } from "@/components/classes/class-enrollments-panel";
import { ClassForm } from "@/components/classes/class-form";
import { ClassSchedulesPanel } from "@/components/classes/class-schedules-panel";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { getCurrentAccount } from "@/lib/auth";
import { getClassDetail } from "@/lib/data/classes-page";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Turma",
};

type Props = {
  params: Promise<{ classId: string }>;
};

async function loadActiveStudents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("status", "active")
    .is("archived_at", null)
    .is("removed_at", null)
    .order("full_name", { ascending: true });
  return (data ?? []).map((r) => ({ id: r.id as string, name: r.full_name as string }));
}

export default async function TurmaDetailPage({ params }: Props) {
  const { classId } = await params;

  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "professor") redirect(ROUTES.painel);

  const [classDetail, activeStudents] = await Promise.all([
    getClassDetail(classId),
    loadActiveStudents(),
  ]);

  if (!classDetail) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DashboardPageHero
        badge="Aulas"
        intro={<DashboardBackLink href={ROUTES.aulasTurmas}>Turmas</DashboardBackLink>}
        title={classDetail.name}
        description={`Instrutor: ${classDetail.instructorName}`}
      />

      <DashboardPanel icon={CalendarDays} title="Dados da turma" subtitle="Nome e modalidade">
        <ClassForm
          mode={{ kind: "edit", classId: classDetail.id }}
          instructorProfileId={ctx.profile.id}
          initial={{ name: classDetail.name, kind: classDetail.kind }}
        />
      </DashboardPanel>

      <DashboardPanel
        icon={CalendarDays}
        title="Horários recorrentes"
        subtitle="ISO 8601: 1 = segunda … 7 = domingo"
      >
        <ClassSchedulesPanel classId={classDetail.id} schedules={classDetail.schedules} />
      </DashboardPanel>

      <DashboardPanel icon={Users} title="Inscrições" subtitle="Alunos matriculados nesta turma">
        <ClassEnrollmentsPanel
          classId={classDetail.id}
          enrollments={classDetail.enrollments}
          availableStudents={activeStudents}
        />
      </DashboardPanel>
    </div>
  );
}
