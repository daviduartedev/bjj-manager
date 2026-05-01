"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { recordPaymentsBulk } from "@/actions/billing";
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
import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";

export type BulkPayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentIds: string[];
  referenceMonth: string;
  totalCents: number;
};

export function BulkPayDialog({
  open,
  onOpenChange,
  studentIds,
  referenceMonth,
  totalCents,
}: BulkPayDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paidAtLocal, setPaidAtLocal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  function submit() {
    if (studentIds.length === 0) return;

    startTransition(async () => {
      const paidAtPayload =
        paidAtLocal.trim() === ""
          ? undefined
          : new Date(paidAtLocal).toISOString();

      const result = await recordPaymentsBulk({
        studentIds,
        referenceMonth,
        paidAt: paidAtPayload,
        notes: notes.trim() === "" ? null : notes.trim(),
        paymentMethod: paymentMethod.trim() === "" ? null : paymentMethod.trim(),
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const { recorded, failures } = result;
      if (failures.length === 0) {
        toast.success(`Registados ${recorded} pagamento(s).`);
      } else {
        toast.warning(
          `Registados ${recorded}. ${failures.length} falha(s), verifique plano ativo.`,
          { duration: 8000 },
        );
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,720px)] flex-col gap-4 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar selecionados como pagos</DialogTitle>
          <DialogDescription>
            Lote: {studentIds.length} aluno(s), mês{" "}
            <span className="font-medium text-foreground">{referenceMonth.slice(0, 7)}</span>.
            Total estimado (preços atuais):{" "}
            <span className="font-semibold text-foreground">
              {formatMoneyBrFromCents(totalCents)}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="bulk-paid-at">Data e hora do pagamento (partilhada)</Label>
            <Input
              id="bulk-paid-at"
              type="datetime-local"
              value={paidAtLocal}
              onChange={(e) => setPaidAtLocal(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-method">Método (opcional)</Label>
            <Input
              id="bulk-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              maxLength={200}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-notes">Observações (opcional)</Label>
            <Textarea
              id="bulk-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={4000}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={pending || studentIds.length === 0}
            onClick={() => submit()}
          >
            {pending ? "A registar…" : "Confirmar lote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
