import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileSignature } from "lucide-react";

import { getEnrollmentLiabilityForm } from "@/actions/enrollment-liability-forms";
import { EnrollmentLiabilityDetailActions } from "@/components/enrollment-liability-forms/enrollment-liability-detail-actions";
import { EnrollmentLiabilityFormEditor } from "@/components/enrollment-liability-forms/enrollment-liability-form-editor";
import { EnrollmentLiabilityDocBadge } from "@/components/enrollment-liability-forms/signature-status-badge";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { formatDateTimeBR } from "@/lib/documents/formatters";
import { loadStudentForEnrollmentForm } from "@/lib/data/enrollment-liability-page";
import { ROUTES, routeAlunoPerfil } from "@/lib/routes";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const r = await getEnrollmentLiabilityForm(id);
  return {
    title: r.ok && r.detail.number ? `Matrícula ${r.detail.number}` : "Matrícula/Termo",
  };
}

export default async function MatriculaTermoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getEnrollmentLiabilityForm(id);
  if (!result.ok) notFound();

  const { detail } = result;
  const { student } = await loadStudentForEnrollmentForm(detail.student_id);
  if (!student) notFound();

  const isDraft = detail.status === "pending" && !detail.pdf_path;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DashboardPageHero
        badge="Matrícula/Termo"
        intro={
          <DashboardBackLink href={ROUTES.matriculasTermos}>
            Matrículas e Termos
          </DashboardBackLink>
        }
        title={detail.number ?? "Rascunho"}
        description={`Criado em ${formatDateTimeBR(detail.created_at)}`}
      />

      <DashboardPanel icon={FileSignature} title="Estado" subtitle="Metadados do registo">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="type-meta-label">Estado</dt>
            <dd>
              <EnrollmentLiabilityDocBadge
                status={detail.status}
                signatureStatus={detail.signature_status}
              />
            </dd>
          </div>
          <div>
            <dt className="type-meta-label">Variante</dt>
            <dd>{detail.variant === "minor" ? "Menor" : detail.variant === "adult" ? "Adulto" : "—"}</dd>
          </div>
          <div>
            <dt className="type-meta-label">Aluno</dt>
            <dd>
              <Link
                href={routeAlunoPerfil(detail.student_id)}
                className="text-primary underline-offset-4 hover:underline"
              >
                {detail.student_name ?? student.full_name}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="type-meta-label">Versão</dt>
            <dd>v{detail.version}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <EnrollmentLiabilityDetailActions detail={detail} />
        </div>
        {detail.error_message ? (
          <p className="mt-4 text-crm-sm text-destructive">{detail.error_message}</p>
        ) : null}
      </DashboardPanel>

      {isDraft && detail.draft ? (
        <DashboardPanel title="Editar rascunho" subtitle="Actualize os campos antes de gerar o PDF">
          <EnrollmentLiabilityFormEditor
            studentId={student.id}
            studentName={student.full_name}
            isMinor={student.isMinor}
            documentId={detail.id}
            initialDraft={detail.draft}
          />
        </DashboardPanel>
      ) : null}

      {!isDraft && detail.pdf_path ? (
        <DashboardPanel
          title="PDF gerado"
          subtitle="Envie por WhatsApp ou registe assinatura manualmente"
        >
          <p className="text-crm-sm text-muted-foreground">
            O PDF segue o modelo ASLAM. Use WhatsApp para enviar o link de assinatura digital ou
            registe um documento já assinado em papel.
          </p>
        </DashboardPanel>
      ) : null}
    </div>
  );
}
