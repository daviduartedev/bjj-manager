import type { Metadata } from "next";
import { FileSignature, Plus } from "lucide-react";

import { EnrollmentLiabilityFormsList } from "@/components/enrollment-liability-forms/enrollment-liability-forms-list";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { loadEnrollmentLiabilityList } from "@/lib/data/enrollment-liability-page";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Matrículas e Termos",
};

type SearchParams = Promise<{
  studentId?: string;
  signatureStatus?: string;
  month?: string;
}>;

export default async function MatriculasTermosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const signatureStatus =
    params.signatureStatus === "awaiting_signature" ||
    params.signatureStatus === "signed"
      ? params.signatureStatus
      : undefined;

  const { rows, error } = await loadEnrollmentLiabilityList({
    studentId: params.studentId,
    signatureStatus,
    month: params.month,
  });

  return (
    <PageFrame
      title="Contratos para assinar"
      icon={FileSignature}
      tone="rose"
      primary={{
        label: "Nova matrícula/termo",
        href: `${ROUTES.matriculasTermos}/novo`,
        icon: <Plus className="size-5" aria-hidden />,
      }}
    >
      <DashboardPanel
        icon={FileSignature}
        title="Registos"
      >
        {error ? (
          <p className="text-crm-sm text-destructive">{error}</p>
        ) : (
          <EnrollmentLiabilityFormsList rows={rows} />
        )}
      </DashboardPanel>
    </PageFrame>
  );
}
