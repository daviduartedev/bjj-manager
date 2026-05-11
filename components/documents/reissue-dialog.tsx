"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { reissueDocument } from "@/actions/documents";
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

type Props = {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReissued?: () => void;
};

export function ReissueDialog({ documentId, open, onOpenChange, onReissued }: Props) {
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!documentId) return;
    if (reason.trim().length < 3) {
      toast.error("Indique o motivo da reemissão.");
      return;
    }
    startTransition(async () => {
      const r = await reissueDocument({ documentId, reason: reason.trim() });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Documento reemitido.");
      setReason("");
      onOpenChange(false);
      onReissued?.();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setReason("");
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reemitir documento</DialogTitle>
          <DialogDescription>
            Indique o motivo. A 1ª via será arquivada e a nova versão receberá um
            número novo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Motivo</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: erro de digitação no nome"
            maxLength={500}
            className="min-h-11"
          />
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            onClick={submit}
            disabled={pending || reason.trim().length < 3}
          >
            {pending ? "Reemitindo…" : "Confirmar reemissão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
