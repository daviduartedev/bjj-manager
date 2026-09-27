import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { ClassForm } from "@/components/classes/class-form";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { getCurrentAccount } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Nova turma",
};

export default async function NovaTurmaPage() {
  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "professor") redirect(ROUTES.painel);

  return (
    <PageFrame
      title="Nova turma"
      context="Preencha o nome e a modalidade. Adicione horários recorrentes depois de criar."
    >
      <div className="space-y-8">
        <DashboardBackLink href={ROUTES.aulasTurmas}>Turmas</DashboardBackLink>
        <DashboardPanel icon={CalendarDays} title="Dados da turma">
          <ClassForm mode={{ kind: "create" }} instructorProfileId={ctx.profile.id} />
        </DashboardPanel>
      </div>
    </PageFrame>
  );
}
