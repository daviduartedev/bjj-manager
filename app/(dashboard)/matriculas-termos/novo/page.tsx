import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnrollmentLiabilityFormEditor } from "@/components/enrollment-liability-forms/enrollment-liability-form-editor";
import { StudentPicker } from "@/components/enrollment-liability-forms/student-picker";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import {
  loadActiveStudentsForPicker,
  loadStudentForEnrollmentForm,
} from "@/lib/data/enrollment-liability-page";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Nova matrícula/termo",
};

type SearchParams = Promise<{ studentId?: string }>;

export default async function NovaMatriculaTermoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const studentId = params.studentId;

  if (!studentId) {
    const { students } = await loadActiveStudentsForPicker();
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <DashboardPageHero
          badge="Nova"
          intro={
            <DashboardBackLink href={ROUTES.matriculasTermos}>
              Matrículas e Termos
            </DashboardBackLink>
          }
          title="Escolher aluno"
          description="Seleccione o aluno para iniciar o formulário ASLAM."
        />
        <DashboardPanel title="Aluno" subtitle="Lista de alunos activos">
          <StudentPicker students={students} />
        </DashboardPanel>
      </div>
    );
  }

  const { student } = await loadStudentForEnrollmentForm(studentId);
  if (!student) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHero
        badge="Nova"
        intro={
          <DashboardBackLink href={ROUTES.matriculasTermos}>
            Matrículas e Termos
          </DashboardBackLink>
        }
        title="Matrícula e Termo de Responsabilidade"
        description="Preencha os campos complementares. O PDF seguirá o modelo ASLAM."
      />
      <DashboardPanel title="Formulário" subtitle="Dados para o documento legal">
        <EnrollmentLiabilityFormEditor
          studentId={student.id}
          studentName={student.full_name}
          isMinor={student.isMinor}
        />
      </DashboardPanel>
    </div>
  );
}
