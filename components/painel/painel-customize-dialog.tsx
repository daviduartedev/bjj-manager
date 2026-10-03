"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { updatePainelHiddenBlocks } from "@/actions/painel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  isPainelBlockVisible,
  PAINEL_BLOCK_IDS,
  PAINEL_BLOCK_LABELS,
  parsePainelHiddenBlocks,
  type PainelBlockId,
} from "@/lib/painel/hidden-blocks";
import { formCheckboxRowClass, primaryActionClass, secondaryActionClass } from "@/lib/ui/form-chrome";

export function PainelCustomizeControl(props: {
  hiddenBlocks: readonly PainelBlockId[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [draftHidden, setDraftHidden] = useState<PainelBlockId[]>(() => [
    ...props.hiddenBlocks,
  ]);

  function openDialog() {
    setDraftHidden([...props.hiddenBlocks]);
    setOpen(true);
  }

  function toggleBlock(id: PainelBlockId, visible: boolean) {
    setDraftHidden((current) => {
      if (visible) return current.filter((item) => item !== id);
      return parsePainelHiddenBlocks([...current, id]);
    });
  }

  function save() {
    startTransition(async () => {
      const result = await updatePainelHiddenBlocks(draftHidden);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 rounded-xl px-3.5 text-sm"
        onClick={openDialog}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Personalizar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="confirm">
          <DialogHeader>
            <DialogTitle>Personalizar</DialogTitle>
            <DialogDescription>
              Escolha os blocos visíveis neste painel. A escolha fica neste
              perfil.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-1">
            {PAINEL_BLOCK_IDS.map((id) => {
              const checked = isPainelBlockVisible(draftHidden, id);
              return (
                <li key={id}>
                  <label className={formCheckboxRowClass}>
                    <Checkbox
                      size="sm"
                      checked={checked}
                      disabled={pending}
                      onCheckedChange={(value) => toggleBlock(id, value === true)}
                    />
                    <span className="text-sm font-medium leading-snug">
                      {PAINEL_BLOCK_LABELS[id]}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className={secondaryActionClass}
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className={primaryActionClass}
              disabled={pending}
              onClick={save}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
