"use client";

import { Download, ExternalLink, MessageCircle, Repeat2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  getDocumentDownloadUrl,
  getWhatsAppShareLink,
} from "@/actions/documents";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentListRow } from "@/lib/data/documents-page";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/types";
import { formatDateTimeBR } from "@/lib/documents/formatters";
import { routeDocumentoDetalhe } from "@/lib/routes";

type Props = {
  rows: DocumentListRow[];
  onReissue: (documentId: string) => void;
};

export function DocumentList({ rows, onReissue }: Props) {
  const [pending, startTransition] = useTransition();

  function withSignedUrl(documentId: string, fn: (url: string) => void) {
    startTransition(async () => {
      const r = await getDocumentDownloadUrl({ documentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      fn(r.url);
    });
  }

  function whatsapp(documentId: string) {
    startTransition(async () => {
      const r = await getWhatsAppShareLink({ documentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      window.open(r.url, "_blank", "noopener,noreferrer");
    });
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-md border bg-card/50 p-6 text-center text-crm-sm text-muted-foreground">
        Sem documentos para os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Aluno</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Emitido em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link
                  href={routeDocumentoDetalhe(row.id)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {DOCUMENT_TYPE_LABELS[row.type]}
                </Link>
                {row.version > 1 ? (
                  <span className="ml-2 text-crm-xs text-muted-foreground">
                    (v{row.version})
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="tabular-nums">{row.number ?? "—"}</TableCell>
              <TableCell>{row.student_name ?? "—"}</TableCell>
              <TableCell>
                <DocumentStatusBadge status={row.status} />
              </TableCell>
              <TableCell>{formatDateTimeBR(row.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="inline-flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending || row.status !== "ready"}
                    onClick={() =>
                      withSignedUrl(row.id, (url) => {
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${row.number ?? row.id}.pdf`;
                        a.rel = "noopener";
                        a.click();
                      })
                    }
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending || row.status !== "ready"}
                    onClick={() =>
                      withSignedUrl(row.id, (url) =>
                        window.open(url, "_blank", "noopener,noreferrer"),
                      )
                    }
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending || row.status !== "ready" || !row.student_id}
                    onClick={() => whatsapp(row.id)}
                  >
                    <MessageCircle className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending || row.status !== "ready"}
                    onClick={() => onReissue(row.id)}
                  >
                    <Repeat2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
