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
import { primaryActionClass, secondaryActionClass } from "@/lib/ui/form-chrome";
import {
  ISENTO_CLEAR_CONFIRM_MESSAGE,
  ISENTO_CONFIRM_MESSAGE,
} from "@/lib/validations/student-form-steps";

export type IsentoConfirmIntent = "mark" | "clear";

export type IsentoConfirmDialogProps = {
  open: boolean;
  intent: IsentoConfirmIntent;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function IsentoConfirmDialog({
  open,
  intent,
  onOpenChange,
  onConfirm,
}: IsentoConfirmDialogProps) {
  const clearing = intent === "clear";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="confirm">
        <DialogHeader>
          <DialogTitle>
            {clearing ? "Voltar à cobrança" : "Confirmar isento"}
          </DialogTitle>
          <DialogDescription>
            {clearing ? ISENTO_CLEAR_CONFIRM_MESSAGE : ISENTO_CONFIRM_MESSAGE}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className={secondaryActionClass}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className={primaryActionClass}
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
