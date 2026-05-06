"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type AdultOrangeBeltConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beltLabel: string;
  onConfirm: () => void;
};

/**
 * Confirma uso da faixa laranja (catálogo juvenil) com tipo de aluno Adulto e plano Adulto.
 */
export function AdultOrangeBeltConfirmDialog({
  open,
  onOpenChange,
  beltLabel,
  onConfirm,
}: AdultOrangeBeltConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar faixa laranja no Adulto</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-left text-sm text-muted-foreground">
              <p>
                Você está definindo <strong className="text-foreground">{beltLabel}</strong>{" "}
                para um aluno do tipo <strong className="text-foreground">Adulto</strong>.
              </p>
              <p>
                Isso vale para situações especiais (por exemplo, correção de faixa após um registo
                temporário em outra cor). O <strong className="text-foreground">plano de mensalidade
                continua Adulto</strong> — apenas a faixa exibida passa a ser da família laranja
                juvenil.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
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
            className="min-h-11 w-full sm:w-auto"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
