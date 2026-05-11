"use client";

import { Download, ExternalLink, MessageCircle, RefreshCw, Repeat2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { retryReceiptGeneration } from "@/actions/billing";
import {
  getDocumentDownloadUrl,
  getWhatsAppShareLink,
  reissueDocument,
} from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ReceiptOutcome =
  | { status: "ready"; documentId: string; number: string; reused: boolean }
  | { status: "failed"; error: string }
  | { status: "skipped" };

type Props = {
  paymentId: string;
  receipt: ReceiptOutcome;
};

export function PostPaymentSummary({ paymentId, receipt: initialReceipt }: Props) {
  const [receipt, setReceipt] = useState<ReceiptOutcome>(initialReceipt);
  const [reissueReason, setReissueReason] = useState("");
  const [reissueOpen, setReissueOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function withSignedUrl(documentId: string, action: (url: string) => void) {
    startTransition(async () => {
      const r = await getDocumentDownloadUrl({ documentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      action(r.url);
    });
  }

  function onDownload() {
    if (receipt.status !== "ready") return;
    withSignedUrl(receipt.documentId, (url) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${receipt.number}.pdf`;
      a.rel = "noopener";
      a.click();
    });
  }

  function onOpenInBrowser() {
    if (receipt.status !== "ready") return;
    withSignedUrl(receipt.documentId, (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  function onWhatsApp() {
    if (receipt.status !== "ready") return;
    startTransition(async () => {
      const r = await getWhatsAppShareLink({ documentId: receipt.documentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      window.open(r.url, "_blank", "noopener,noreferrer");
    });
  }

  function onReissue() {
    if (receipt.status !== "ready") {
      toast.error("Não há recibo para reemitir.");
      return;
    }
    if (reissueReason.trim().length < 3) {
      toast.error("Indique o motivo da reemissão.");
      return;
    }
    startTransition(async () => {
      const r = await reissueDocument({
        documentId: receipt.documentId,
        reason: reissueReason.trim(),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Recibo reemitido.");
      setReceipt({
        status: "ready",
        documentId: r.documentId,
        number: r.number,
        reused: false,
      });
      setReissueOpen(false);
      setReissueReason("");
    });
  }

  function onRetry() {
    startTransition(async () => {
      const r = await retryReceiptGeneration({ paymentId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      if (r.receipt.status === "ready") {
        toast.success("Recibo gerado.");
        setReceipt(r.receipt);
      } else if (r.receipt.status === "failed") {
        toast.error(r.receipt.error);
        setReceipt(r.receipt);
      }
    });
  }

  if (receipt.status === "skipped") {
    return (
      <p className="text-crm-sm text-muted-foreground">
        Pagamento registrado. Como o tipo selecionado foi bolsista/outro, não geramos
        recibo automático.
      </p>
    );
  }

  if (receipt.status === "failed") {
    return (
      <div className="space-y-3 rounded-md border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-400/30 dark:bg-amber-950/40">
        <p className="text-crm-sm text-amber-900 dark:text-amber-200">
          O pagamento foi salvo mas o recibo falhou: {receipt.error}.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={pending}
          className="min-h-11 touch-manipulation"
        >
          <RefreshCw className="mr-2 size-4" /> Tentar gerar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-emerald-300/50 bg-emerald-50 p-3 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-950/40 dark:text-emerald-200">
        <p className="text-crm-sm font-medium">Recibo {receipt.number} pronto.</p>
        <p className="text-crm-xs">Pode partilhar com o aluno em segundos.</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDownload}
          disabled={pending}
          className="min-h-11 touch-manipulation"
        >
          <Download className="mr-2 size-4" /> Baixar PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenInBrowser}
          disabled={pending}
          className="min-h-11 touch-manipulation"
        >
          <ExternalLink className="mr-2 size-4" /> Abrir no navegador
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onWhatsApp}
          disabled={pending}
          className="min-h-11 touch-manipulation"
        >
          <MessageCircle className="mr-2 size-4" /> Enviar por WhatsApp
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setReissueOpen((v) => !v)}
          disabled={pending}
          className="min-h-11 touch-manipulation"
        >
          <Repeat2 className="mr-2 size-4" /> Reemitir
        </Button>
      </div>

      {reissueOpen ? (
        <div className="space-y-2 rounded-md border bg-card/60 p-3">
          <Label htmlFor="reissue-reason" className="text-crm-sm">
            Motivo da reemissão
          </Label>
          <Input
            id="reissue-reason"
            value={reissueReason}
            onChange={(e) => setReissueReason(e.target.value)}
            placeholder="Ex.: erro de digitação no nome"
            maxLength={500}
            className="min-h-11"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setReissueOpen(false);
                setReissueReason("");
              }}
              disabled={pending}
              className="min-h-11"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onReissue}
              disabled={pending || reissueReason.trim().length < 3}
              className="min-h-11"
            >
              Confirmar reemissão
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
