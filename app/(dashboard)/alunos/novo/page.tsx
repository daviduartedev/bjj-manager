import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import { StudentForm } from "@/components/students/student-form";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
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
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHero
        badge="Cadastro"
        intro={<DashboardBackLink href={ROUTES.alunos}>Alunos</DashboardBackLink>}
        title="Novo aluno"
        description="Preencha os dados obrigatórios. Campos opcionais ajudam no contacto e na gestão."
      />

      <DashboardPanel
        icon={UserPlus}
        title="Ficha do aluno"
        subtitle="Tipo, faixa, plano e dados pessoais"
        contentClassName="flex justify-center"
      >
        <StudentForm belts={belts} plans={plans} mode="create" defaultValues={defaults} />
      </DashboardPanel>
    </div>
  );
}
