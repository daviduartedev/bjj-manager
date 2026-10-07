import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { StudentForm } from "@/components/students/student-form";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { getStudentCatalog } from "@/lib/data/students-catalog";
import { defaultCreateStudentValues } from "@/lib/students/default-form-values";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Novo aluno",
};

export default async function NovoAlunoPage() {
  const { belts, plans } = await getStudentCatalog();
  const defaults = defaultCreateStudentValues(belts, plans);

  return (
    <PageFrame
      title="Novo aluno"
      emoji="➕"
      icon={UserPlus}
      tone="emerald"
    >
      <div className="space-y-6">
      <DashboardBackLink href={ROUTES.alunos}>Alunos</DashboardBackLink>
      <DashboardPanel
        className="mx-auto w-full max-w-3xl"
        icon={UserPlus}
        title="Ficha do aluno"
        subtitle="Tipo, faixa, plano e dados pessoais"
      >
        <StudentForm belts={belts} plans={plans} mode="create" defaultValues={defaults} />
      </DashboardPanel>
      </div>
    </PageFrame>
  );
}
