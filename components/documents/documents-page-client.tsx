"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { DocumentList } from "@/components/documents/document-list";
import { ReissueDialog } from "@/components/documents/reissue-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocumentListRow } from "@/lib/data/documents-page";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/types";

const TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  ...(
    [
      "payment_receipt",
      "enrollment_proof",
      "enrollment_liability_form",
      "certificate",
      "liability_term",
      "manual_receipt",
    ] as const
  ).map((t) => ({ value: t, label: DOCUMENT_TYPE_LABELS[t] })),
];

const STATUS_OPTIONS = [
  { value: "all", label: "Qualquer estado" },
  { value: "ready", label: "Pronto" },
  { value: "pending", label: "A gerar" },
  { value: "failed", label: "Falhou" },
  { value: "archived", label: "Arquivado" },
];

export function DocumentsPageClient({ rows }: { rows: DocumentListRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reissueId, setReissueId] = useState<string | null>(null);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.push(`/documentos${next.toString() ? `?${next.toString()}` : ""}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 md:max-w-md">
        <div>
          <Select
            value={searchParams.get("type") ?? "all"}
            onValueChange={(v) => setParam("type", v)}
          >
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(v) => setParam("status", v)}
          >
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DocumentList rows={rows} onReissue={(id) => setReissueId(id)} />

      <ReissueDialog
        open={reissueId !== null}
        documentId={reissueId}
        onOpenChange={(o) => {
          if (!o) setReissueId(null);
        }}
        onReissued={() => router.refresh()}
      />
    </div>
  );
}
