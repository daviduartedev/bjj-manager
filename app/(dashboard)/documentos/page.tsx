import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { DocumentsPageClient } from "@/components/documents/documents-page-client";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PageFrame } from "@/components/prototype/page-frame";
import { loadDocumentsPageData } from "@/lib/data/documents-page";
import type { DocumentType } from "@/lib/documents/types";

export const metadata: Metadata = {
  title: "Documentos",
};

type SearchParams = Promise<{
  type?: string;
  status?: string;
}>;

const TYPES: DocumentType[] = [
  "payment_receipt",
  "enrollment_proof",
  "enrollment_liability_form",
  "certificate",
  "liability_term",
  "manual_receipt",
];
const STATUSES = ["pending", "ready", "failed", "archived"] as const;

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const type = params.type && TYPES.includes(params.type as DocumentType)
    ? (params.type as DocumentType)
    : undefined;
  const status =
    params.status && (STATUSES as readonly string[]).includes(params.status)
      ? (params.status as (typeof STATUSES)[number])
      : undefined;

  const { rows } = await loadDocumentsPageData({ type, status });

  return (
    <PageFrame
      title="Documentos"
      emoji="📄"
      icon={FileText}
      tone="amber"
    >
      <div data-tour="page-documentos">
        <DashboardPanel
          icon={FileText}
          title="Documentos emitidos"
        >
          <DocumentsPageClient rows={rows} />
        </DashboardPanel>
      </div>
    </PageFrame>
  );
}
