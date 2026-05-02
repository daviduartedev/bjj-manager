"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { recordPayment } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/routes";
import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";

export type RecordPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  defaultReferenceMonth: string;
  /** Preço efetivo atual (somente leitura; o servidor grava este valor em pagamentos normais). */
  amountCents: number | null;
};

export function RecordPaymentDialog({
  open,
  onOpenChange,
  studentId,
  defaultReferenceMonth,
  amountCents,
}: RecordPaymentDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingKind, setPendingKind] = useState<"paid" | "scholarship" | null>(
    null,
  );
  const [referenceMonth, setReferenceMonth] = useState(defaultReferenceMonth);
  const [paidAtLocal, setPaidAtLocal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setReferenceMonth(defaultReferenceMonth);
      setPaidAtLocal("");
      setPaymentMethod("");
      setNotes("");
      setPendingKind(null);
    }
  }, [open, defaultReferenceMonth]);

  const monthControlValue = referenceMonth.slice(0, 7);

  function submit(kind: "paid" | "scholarship") {
    if (amountCents == null) {
      toast.error(
        "Este aluno não tem plano ativo. Associe um plano antes de registrar.",
      );
      return;
    }

    setPendingKind(kind);
    startTransition(async () => {
      try {
        const paidAtPayload =
          paidAtLocal.trim() === ""
            ? undefined
            : new Date(paidAtLocal).toISOString();

        const result = await recordPayment({
          studentId,
          referenceMonth,
          recordingKind: kind,
          paidAt: paidAtPayload,
          notes: notes.trim() === "" ? null : notes.trim(),
          paymentMethod:
            paymentMethod.trim() === "" ? null : paymentMethod.trim(),
        });

        if (!result.ok) {
          toast.error(result.error);
          return;
        }

        toast.success(
          kind === "scholarship"
            ? "Isenção (bolsista) registrada."
            : "Pagamento registrado.",
        );
        onOpenChange(false);
        router.refresh();
      } finally {
        setPendingKind(null);
      }
    });
  }

  const canSubmit = amountCents != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] flex-col gap-4 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            Valor conforme plano ativo. Para isenção, use «Bolsista (isento)» em vez de confirmar pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Referência: Adulto R$&nbsp;120, Kids 1 e Kids 2 R$&nbsp;100 (ajuste em{" "}
            <Link
              href={ROUTES.configuracoes}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Configurações
            </Link>
            ).
          </p>
          <p>
            O valor não pode ser editado aqui: na confirmação usa-se o preço vigente do plano ou R$&nbsp;0 para bolsista.
          </p>
        </div>

        <div className="grid gap-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="ref-month">Mês de referência</Label>
            <Input
              id="ref-month"
              type="month"
              value={monthControlValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v) setReferenceMonth(`${v}-01`);
              }}
              className="min-h-11"
            />
          </div>

          <div className="space-y-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Valor do plano (referência)
            </p>
            <p className="type-lead tabular-nums-crm text-lg font-semibold text-foreground">
              {amountCents != null ? formatMoneyBrFromCents(amountCents) : ","}
            </p>
            {amountCents == null ? (
              <p className="text-sm text-destructive">
                Sem plano ativo, não é possível registrar.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Pagamento normal grava este valor; bolsista grava R$&nbsp;0,00.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paid-at">Data e hora do pagamento</Label>
            <Input
              id="paid-at"
              type="datetime-local"
              value={paidAtLocal}
              onChange={(e) => setPaidAtLocal(e.target.value)}
              className="min-h-11"
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar a data e hora atuais no servidor.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-method">Método (opcional)</Label>
            <Input
              id="pay-method"
              placeholder="Ex.: PIX, dinheiro, cartão…"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              maxLength={200}
              className="min-h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-notes">Observações (opcional)</Label>
            <Textarea
              id="pay-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={4000}
              className="resize-y"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full sm:w-auto"
            disabled={pending || !canSubmit}
            onClick={() => submit("scholarship")}
          >
            {pending && pendingKind === "scholarship"
              ? "Registrando…"
              : "Bolsista (isento)"}
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            disabled={pending || !canSubmit}
            onClick={() => submit("paid")}
          >
            {pending && pendingKind === "paid"
              ? "Registrando…"
              : "Confirmar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
