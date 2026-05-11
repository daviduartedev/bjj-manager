import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { DocumentsPageClient } from "@/components/documents/documents-page-client";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
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
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardPageHero
        badge="Documentos"
        title="Histórico de documentos"
        description="Recibos, comprovantes, certificados e termos emitidos pela academia."
      />
      <DashboardPanel
        icon={FileText}
        title="Documentos emitidos"
        subtitle="Filtros por tipo e estado. Atalhos rápidos por linha"
      >
        <DocumentsPageClient rows={rows} />
      </DashboardPanel>
    </div>
  );
}
