import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { ClassForm } from "@/components/classes/class-form";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <DashboardPageHero
        badge="Aulas"
        intro={<DashboardBackLink href={ROUTES.aulasTurmas}>Turmas</DashboardBackLink>}
        title="Nova turma"
        description="Preencha o nome e a modalidade. Adicione horários recorrentes depois de criar."
      />
      <DashboardPanel icon={CalendarDays} title="Dados da turma">
        <ClassForm mode={{ kind: "create" }} instructorProfileId={ctx.profile.id} />
      </DashboardPanel>
    </div>
  );
}
