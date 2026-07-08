import type { Metadata } from "next";
import { FilePenLine } from "lucide-react";
import { notFound } from "next/navigation";

import { StudentForm } from "@/components/students/student-form";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { getStudentByIdForEdit } from "@/lib/data/students-detail";
import { getStudentCatalog } from "@/lib/data/students-catalog";
import { ROUTES } from "@/lib/routes";
import { maskCpfInput, maskPhoneBrInput } from "@/lib/students/input-masks";
import type { StudentFullFormValues } from "@/lib/validations/students";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudentByIdForEdit(id);
  return {
    title: student ? `Editar, ${student.full_name}` : "Editar aluno",
  };
}

export default async function EditarAlunoPage({ params }: PageProps) {
  const { id } = await params;
  const [{ belts, plans }, student] = await Promise.all([
    getStudentCatalog(),
    getStudentByIdForEdit(id),
  ]);

  if (!student) notFound();

  const defaults: StudentFullFormValues = {
    full_name: student.full_name,
    birth_date: student.birth_date ?? "",
    academy_start_date: student.academy_start_date ?? "",
    kind: student.kind,
    current_belt_id: student.current_belt_id,
    current_degree: student.current_degree,
    is_exempt: student.is_exempt,
    plan_id: student.plan_id ?? "",
    due_day: student.due_day ?? 10,
    document: student.document ? maskCpfInput(student.document) : undefined,
    phone: student.phone ? maskPhoneBrInput(student.phone) : undefined,
    guardian_phone: student.guardian_phone
      ? maskPhoneBrInput(student.guardian_phone)
      : undefined,
    email: student.email ?? undefined,
    notes: student.notes ?? undefined,
    weight_kg: student.graduationWeightKg ?? null,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Edição"
        intro={<DashboardBackLink href={ROUTES.alunos}>Alunos</DashboardBackLink>}
        title="Editar aluno"
        description={student.full_name}
      >
        {!student.plan_id ? (
          <p
            className="mt-4 rounded-lg border border-[hsl(var(--status-pending)/0.35)] bg-[hsl(var(--status-pending)/0.08)] px-4 py-3 text-crm-sm text-foreground"
            role="status"
          >
            Este aluno não tem plano ativo associado. Escolha um plano compatível e salve.
          </p>
        ) : null}
      </DashboardPageHero>

      <DashboardPanel
        icon={FilePenLine}
        title="Ficha completa"
        subtitle="Atualize dados pessoais, faixa e vínculo de plano"
        contentClassName="flex justify-center"
      >
        <StudentForm
          belts={belts}
          plans={plans}
          mode="edit"
          studentId={id}
          defaultValues={defaults}
          graduationEventId={student.graduationEventId}
        />
      </DashboardPanel>
    </div>
  );
}
