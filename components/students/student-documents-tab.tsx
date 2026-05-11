"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { listDocuments, type DocumentRow } from "@/actions/documents";
import { DocumentGenerateDialog } from "@/components/documents/document-generate-dialog";
import { DocumentList } from "@/components/documents/document-list";
import { ReissueDialog } from "@/components/documents/reissue-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DocumentListRow } from "@/lib/data/documents-page";

type Props = { studentId: string };

function toRow(r: DocumentRow): DocumentListRow {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    number: r.number,
    version: r.version,
    reissue_reason: r.reissue_reason,
    supersedes_id: r.supersedes_id,
    student_id: r.student_id,
    student_name: null,
    payment_id: r.payment_id,
    byte_size: r.byte_size,
    error_code: r.error_code,
    error_message: r.error_message,
    created_at: r.created_at,
  };
}

export function StudentDocumentsTab({ studentId }: Props) {
  const [rows, setRows] = useState<DocumentListRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [reissueId, setReissueId] = useState<string | null>(null);

  function reload() {
    startTransition(async () => {
      const r = await listDocuments({ studentId });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setError(null);
      setRows(r.rows.map(toRow));
    });
  }

  useEffect(reload, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">Documentos do aluno</h3>
            <p className="text-crm-sm text-muted-foreground">
              Histórico ordenado pelo mais recente. Recibos automáticos aparecem aqui.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="min-h-11 touch-manipulation"
          >
            <Plus className="mr-2 size-4" /> Gerar documento
          </Button>
        </div>

        {pending ? (
          <p className="text-crm-sm text-muted-foreground">Carregando…</p>
        ) : error ? (
          <p className="text-crm-sm text-destructive">{error}</p>
        ) : (
          <DocumentList rows={rows} onReissue={(id) => setReissueId(id)} />
        )}

        <DocumentGenerateDialog
          studentId={studentId}
          open={generateOpen}
          onOpenChange={setGenerateOpen}
          onGenerated={reload}
        />
        <ReissueDialog
          documentId={reissueId}
          open={reissueId !== null}
          onOpenChange={(o) => {
            if (!o) setReissueId(null);
          }}
          onReissued={reload}
        />
      </CardContent>
    </Card>
  );
}
