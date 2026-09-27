import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileSignature, Users } from "lucide-react";

import { EnrollmentLiabilityFormEditor } from "@/components/enrollment-liability-forms/enrollment-liability-form-editor";
import { StudentPicker } from "@/components/enrollment-liability-forms/student-picker";
import { PageFrame } from "@/components/prototype/page-frame";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import {
  loadActiveStudentsForPicker,
  loadStudentForEnrollmentForm,
} from "@/lib/data/enrollment-liability-page";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Nova matrícula/termo",
};

type SearchParams = Promise<{ studentId?: string; variant?: string }>;

export default async function NovaMatriculaTermoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const studentId = params.studentId;
  const frameVariant =
    params.variant === "A" || params.variant === "B" || params.variant === "C"
      ? params.variant
      : undefined;

  if (!studentId) {
    const { students } = await loadActiveStudentsForPicker();
    return (
      <PageFrame
        title="Escolher aluno"
        emoji="👤"
        icon={Users}
        tone="sky"
      >
        <div className="space-y-8">
          <DashboardBackLink href={ROUTES.matriculasTermos}>
            Matrículas e Termos
          </DashboardBackLink>
          <DashboardPanel icon={Users} title="Aluno" subtitle="Lista de alunos activos">
            <StudentPicker students={students} variant={frameVariant} />
          </DashboardPanel>
        </div>
      </PageFrame>
    );
  }

  const { student } = await loadStudentForEnrollmentForm(studentId);
  if (!student) notFound();

  return (
    <PageFrame
      title="Novo termo"
      emoji="✍️"
      icon={FileSignature}
      tone="rose"
    >
      <div className="space-y-8">
        <DashboardBackLink href={ROUTES.matriculasTermos}>
          Matrículas e Termos
        </DashboardBackLink>
        <DashboardPanel icon={FileSignature} title="Formulário" subtitle="Dados para o documento legal">
          <EnrollmentLiabilityFormEditor
            studentId={student.id}
            studentName={student.full_name}
            isMinor={student.isMinor}
          />
        </DashboardPanel>
      </div>
    </PageFrame>
  );
}
