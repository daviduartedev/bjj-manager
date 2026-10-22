"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { switchAcademyModality } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACADEMY_MODALITIES, MODALITY_LABELS, type AcademyModality } from "@/lib/modalities/catalog";
import {
  cancelSwitch,
  modalitySwitchEffects,
  selectSwitchTarget,
  type ModalitySwitchDraft,
} from "@/lib/settings/modality-switch";
import { formActionsClass, primaryActionClass } from "@/lib/ui/form-chrome";

type Props = {
  current: AcademyModality;
  onSaved: () => void;
};

export function ModalitySwitchPanel({ current, onSaved }: Props) {
  const destinations = ACADEMY_MODALITIES.filter((modality) => modality !== current);
  const [choice, setChoice] = useState<AcademyModality>(destinations[0]);
  const [draft, setDraft] = useState<ModalitySwitchDraft>({ target: null });
  const [pending, startTransition] = useTransition();
  const selected = destinations.includes(choice) ? choice : destinations[0];

  function confirm() {
    if (!draft.target) return;
    startTransition(async () => {
      const result = await switchAcademyModality(draft.target);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDraft(cancelSwitch());
      toast.success(`Modalidade alterada para ${MODALITY_LABELS[draft.target!]}.`);
      onSaved();
    });
  }

  return (
    <div className="mx-auto mt-6 flex max-w-lg flex-col gap-4 border-t pt-6">
      <div>
        <h3 className="text-crm-sm font-medium">Trocar modalidade</h3>
        <p className="mt-1 text-crm-sm text-muted-foreground">
          Só enquanto não houver aluno, turma, aula, pagamento ou documento. Os planos comerciais ficam como estão.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="modality-switch-target">Nova modalidade</Label>
        <Select value={selected} onValueChange={(value) => setChoice(value as AcademyModality)}>
          <SelectTrigger id="modality-switch-target" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((modality) => (
              <SelectItem key={modality} value={modality}>
                {MODALITY_LABELS[modality]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {draft.target ? (
        <div className="flex flex-col gap-3" role="region" aria-label="Confirmar troca de modalidade">
          <p className="text-crm-sm font-medium">Confirmar troca para {MODALITY_LABELS[draft.target]}</p>
          <ul className="list-disc space-y-1 pl-5 text-crm-sm text-muted-foreground">
            {modalitySwitchEffects(current, draft.target).map((effect) => (
              <li key={effect}>{effect}</li>
            ))}
          </ul>
          <div className={formActionsClass}>
            <Button type="button" className={primaryActionClass} disabled={pending} onClick={confirm}>
              {pending ? "Trocando…" : "Confirmar troca"}
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setDraft(cancelSwitch())}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className={formActionsClass}>
          <Button type="button" variant="outline" onClick={() => setDraft(selectSwitchTarget(selected))}>
            Revisar troca
          </Button>
        </div>
      )}
    </div>
  );
}
