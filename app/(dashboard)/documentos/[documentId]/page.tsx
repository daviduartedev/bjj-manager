import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { DashboardBackLink } from "@/components/layout/dashboard-back-link";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { loadDocumentById } from "@/lib/data/documents-page";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/types";
import { formatDateTimeBR } from "@/lib/documents/formatters";
import { ROUTES, routeAlunoPerfil } from "@/lib/routes";

import { DocumentDetailActions } from "./detail-actions";

type PageProps = { params: Promise<{ documentId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { documentId } = await params;
  const { doc } = await loadDocumentById(documentId);
  return { title: doc?.number ? `Documento ${doc.number}` : "Documento" };
}

export default async function DocumentoDetalhePage({ params }: PageProps) {
  const { documentId } = await params;
  const { doc, payload } = await loadDocumentById(documentId);
  if (!doc) notFound();

  const issuedAt = (payload?.issuedAt as string | undefined) ?? doc.created_at;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DashboardPageHero
        badge="Documento"
        intro={<DashboardBackLink href={ROUTES.documentos}>Documentos</DashboardBackLink>}
        title={`${DOCUMENT_TYPE_LABELS[doc.type]} ${doc.number ?? ""}`.trim()}
        description={`Emitido em ${formatDateTimeBR(issuedAt)}`}
      />

      <DashboardPanel icon={FileText} title="Detalhes" subtitle="Informações de emissão e estado">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="type-meta-label">Estado</dt>
            <dd>
              <DocumentStatusBadge status={doc.status} />
            </dd>
          </div>
          <div>
            <dt className="type-meta-label">Versão</dt>
            <dd>v{doc.version}</dd>
          </div>
          <div>
            <dt className="type-meta-label">Aluno</dt>
            <dd>
              {doc.student_id && doc.student_name ? (
                <Link
                  href={routeAlunoPerfil(doc.student_id)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {doc.student_name}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="type-meta-label">Tamanho</dt>
            <dd className="tabular-nums">
              {doc.byte_size != null ? `${(doc.byte_size / 1024).toFixed(1)} KB` : "—"}
            </dd>
          </div>
          {doc.reissue_reason ? (
            <div className="sm:col-span-2">
              <dt className="type-meta-label">Motivo da reemissão</dt>
              <dd>{doc.reissue_reason}</dd>
            </div>
          ) : null}
          {doc.error_message ? (
            <div className="sm:col-span-2">
              <dt className="type-meta-label">Falha</dt>
              <dd className="text-destructive">{doc.error_message}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6">
          <DocumentDetailActions documentId={doc.id} status={doc.status} />
        </div>
      </DashboardPanel>
    </div>
  );
}
