import type { Metadata } from "next";
import Link from "next/link";
import { FileSignature, Plus } from "lucide-react";

import { EnrollmentLiabilityFormsList } from "@/components/enrollment-liability-forms/enrollment-liability-forms-list";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Documentos"
        title="Matrículas e Termos ASLAM"
        description="Formulários legais de matrícula e termo de responsabilidade com envio e assinatura digital."
        aside={
          <Button asChild className="min-h-11">
            <Link href={`${ROUTES.matriculasTermos}/novo`}>
              <Plus className="mr-2 size-4" />
              Nova matrícula/termo
            </Link>
          </Button>
        }
      />

      <DashboardPanel
        icon={FileSignature}
        title="Registos"
        subtitle="Rascunhos, PDFs gerados e documentos aguardando assinatura"
      >
        {error ? (
          <p className="text-crm-sm text-destructive">{error}</p>
        ) : (
          <EnrollmentLiabilityFormsList rows={rows} />
        )}
      </DashboardPanel>
    </div>
  );
}
