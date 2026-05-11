"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getReceiptForPayment,
  retryReceiptGeneration,
  type ReceiptLookup,
} from "@/actions/billing";
import { PostPaymentSummary } from "@/components/billing/post-payment-summary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ReceiptViewerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  /** Nome do aluno para o cabeçalho do popup. */
  studentName: string;
  /** Mês de referência humanizado (ex.: "Maio/2026") para contexto. */
  referenceMonthLabel?: string;
};

type ViewState =
  | { kind: "loading" }
  | { kind: "ready"; documentId: string; number: string }
  | { kind: "failed"; error: string }
  | { kind: "missing" }
  | { kind: "error"; error: string };

function lookupToView(lookup: ReceiptLookup): ViewState {
  if (lookup.status === "ready") {
    return { kind: "ready", documentId: lookup.documentId, number: lookup.number };
  }
  if (lookup.status === "failed") {
    return { kind: "failed", error: lookup.error };
  }
  return { kind: "missing" };
}

export function ReceiptViewerDialog({
  open,
  onOpenChange,
  paymentId,
  studentName,
  referenceMonthLabel,
}: ReceiptViewerDialogProps) {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setState({ kind: "loading" });
    void (async () => {
      const r = await getReceiptForPayment({ paymentId });
      if (cancelled) return;
      if (!r.ok) {
        setState({ kind: "error", error: r.error });
        return;
      }
      setState(lookupToView(r.receipt));
    })();
    return () => {
      cancelled = true;
    };
  }, [open, paymentId]);

  function onGenerate() {
    startTransition(async () => {
      const r = await retryReceiptGeneration({ paymentId });
      if (!r.ok) {
        toast.error(r.error);
        setState({ kind: "error", error: r.error });
        return;
      }
      if (r.receipt.status === "ready") {
        toast.success(
          r.receipt.reused ? "Recibo já existente." : "Recibo gerado.",
        );
        setState({
          kind: "ready",
          documentId: r.receipt.documentId,
          number: r.receipt.number,
        });
      } else if (r.receipt.status === "failed") {
        toast.error(r.receipt.error);
        setState({ kind: "failed", error: r.receipt.error });
      } else {
        setState({
          kind: "error",
          error: "Não foi possível gerar o recibo neste pagamento.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comprovante de pagamento</DialogTitle>
          <DialogDescription>
            {studentName}
            {referenceMonthLabel ? ` · ${referenceMonthLabel}` : null}
          </DialogDescription>
        </DialogHeader>

        {state.kind === "loading" ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> A verificar comprovante…
          </div>
        ) : null}

        {state.kind === "ready" ? (
          <PostPaymentSummary
            paymentId={paymentId}
            receipt={{
              status: "ready",
              documentId: state.documentId,
              number: state.number,
              reused: true,
            }}
          />
        ) : null}

        {state.kind === "missing" ? (
          <div className="space-y-3">
            <p className="text-crm-sm text-muted-foreground">
              Ainda não há comprovante gerado para este pagamento. Pode gerar
              agora — o número será emitido na sequência da academia.
            </p>
            <Button
              type="button"
              onClick={onGenerate}
              disabled={pending}
              className="min-h-11 w-full sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> A gerar…
                </>
              ) : (
                "Gerar comprovante"
              )}
            </Button>
          </div>
        ) : null}

        {state.kind === "failed" ? (
          <div className="space-y-3 rounded-md border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-400/30 dark:bg-amber-950/40">
            <p className="text-crm-sm text-amber-900 dark:text-amber-200">
              A última tentativa falhou: {state.error}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGenerate}
              disabled={pending}
              className="min-h-11 touch-manipulation"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> A tentar…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 size-4" /> Tentar novamente
                </>
              )}
            </Button>
          </div>
        ) : null}

        {state.kind === "error" ? (
          <p className="text-crm-sm text-destructive">{state.error}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
