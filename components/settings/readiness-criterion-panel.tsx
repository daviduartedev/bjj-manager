"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award } from "lucide-react";
import { toast } from "sonner";

import { updateReadinessCriterion } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyActionFailureToForm } from "@/lib/ui/action-field-errors";
import {
  formActionsClass,
  formShellClass,
  primaryActionClass,
  secondaryActionClass,
} from "@/lib/ui/form-chrome";
import {
  READINESS_CONFIRM_MESSAGE,
  updateReadinessCriterionSchema,
  type UpdateReadinessCriterionInput,
} from "@/lib/validations/settings";
import type { KidsDegreeMonths } from "@/lib/students/readiness-alert";

const KIDS_CADENCE_OPTIONS: { value: KidsDegreeMonths; label: string }[] = [
  { value: 3, label: "3 meses por grau (faixa aos 12 meses)" },
  { value: 4, label: "4 meses por grau (faixa aos 16 meses)" },
  { value: 1, label: "1 mês por grau (faixa aos 4 meses)" },
];

function asKidsMonths(value: number | null): KidsDegreeMonths {
  if (value === 1 || value === 3 || value === 4) return value;
  return 4;
}

export function ReadinessCriterionPanel(props: {
  kidsDegreeMonths: number | null;
  confirmedAt: string | null;
}) {
  const router = useRouter();
  const confirmed = Boolean(props.confirmedAt);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const form = useForm<UpdateReadinessCriterionInput>({
    resolver: zodResolver(updateReadinessCriterionSchema),
    defaultValues: {
      kidsDegreeMonths: asKidsMonths(props.kidsDegreeMonths),
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    form.reset({
      kidsDegreeMonths: asKidsMonths(props.kidsDegreeMonths),
    });
  }, [props.kidsDegreeMonths, form]);

  async function persist(values: UpdateReadinessCriterionInput) {
    const r = await updateReadinessCriterion(values);
    if (!r.ok) {
      const { toastError } = applyActionFailureToForm(form.setError, r);
      if (toastError) toast.error(r.error);
      return;
    }
    toast.success(
      confirmed
        ? "Critério de prontidão atualizado."
        : "Critério de prontidão confirmado.",
    );
    setConfirmOpen(false);
    router.refresh();
  }

  function onSubmit(values: UpdateReadinessCriterionInput) {
    if (!confirmed) {
      setConfirmOpen(true);
      return;
    }
    void persist(values);
  }

  const selected = form.watch("kidsDegreeMonths");

  return (
    <>
      <DashboardPanel
        icon={Award}
        title="Critério de prontidão"
        subtitle="Quando um aluno activo entra no alerta de graduação. Não impede promover."
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={`${formShellClass} flex flex-col gap-4`}
          >
            {confirmed ? (
              <p className="text-crm-sm text-muted-foreground">
                Cadência kids actual:{" "}
                <span className="font-medium text-foreground">
                  {asKidsMonths(props.kidsDegreeMonths)}{" "}
                  {asKidsMonths(props.kidsDegreeMonths) === 1 ? "mês" : "meses"}{" "}
                  por grau
                </span>
                . Pode alterar sem novo aceite.
              </p>
            ) : (
              <p className="text-crm-sm text-muted-foreground">
                Até confirmar, o alerta usa 4 meses no grau ou 12 meses na
                faixa para toda a gente (excepto preta e coral).
              </p>
            )}

            <FormField
              control={form.control}
              name="kidsDegreeMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cadência kids (por grau)</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) =>
                      field.onChange(Number(v) as KidsDegreeMonths)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {KIDS_CADENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-crm-sm text-muted-foreground">
              Adultos seguem os mínimos IBJJF: azul 2 anos na faixa, roxa 18
              meses, marrom 1 ano; o alerta de grau usa um quarto desse tempo.
              Branca adulta não tem alerta de faixa — só grau aos 4 meses.
              Preta e coral ficam fora.
            </p>

            <div className={formActionsClass}>
              <Button
                type="submit"
                className={primaryActionClass}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Salvando…"
                  : confirmed
                    ? "Salvar critério"
                    : "Salvar e confirmar"}
              </Button>
            </div>
          </form>
        </Form>
      </DashboardPanel>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="confirm">
          <DialogHeader>
            <DialogTitle>Confirmar critério de prontidão</DialogTitle>
            <DialogDescription>{READINESS_CONFIRM_MESSAGE}</DialogDescription>
          </DialogHeader>
          <p className="text-crm-sm text-muted-foreground">
            Kids: {selected} {selected === 1 ? "mês" : "meses"} por grau (faixa
            aos {selected * 4} meses). Adultos nos mínimos IBJJF descritos
            acima.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className={secondaryActionClass}
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className={primaryActionClass}
              disabled={form.formState.isSubmitting}
              onClick={() =>
                void persist({
                  kidsDegreeMonths: form.getValues("kidsDegreeMonths"),
                  confirmAccepted: true,
                })
              }
            >
              {form.formState.isSubmitting ? "Salvando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
