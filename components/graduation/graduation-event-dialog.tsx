"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  addGraduation,
  promoteStudent,
  updateGraduation,
} from "@/actions/graduations";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BeltCatalogRow } from "@/lib/data/students-catalog";
import { buildBeltCatalogMap } from "@/lib/graduation/catalog";
import { isBeltSkip, isSameBelt } from "@/lib/graduation/belt-order";
import { beltLabelPt } from "@/lib/students/belt-labels";
import { degreeOptionsForBelt } from "@/lib/students/degree";
import type { StudentKind } from "@/lib/students/degree";
import {
  graduationEventSchema,
  type GraduationEventFormValues,
} from "@/lib/validations/graduations";

export type GraduationDialogMode = "promote" | "add" | "edit";

export type GraduationDialogInitial = {
  graduationId?: string;
  resulting_belt_id: string;
  resulting_degree: number;
  graduated_at: string;
  was_skip: boolean;
  skip_reason?: string | null;
  weight_kg?: number | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: GraduationDialogMode;
  studentId: string;
  studentKind: StudentKind;
  ageYears: number | null;
  currentBeltId: string;
  currentDegree: number;
  belts: BeltCatalogRow[];
  initial?: GraduationDialogInitial | null;
  onSuccess?: () => void;
};

function defaultGraduatedAtYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function GraduationEventDialog({
  open,
  onOpenChange,
  mode,
  studentId,
  studentKind,
  ageYears,
  currentBeltId,
  currentDegree,
  belts,
  initial,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showAllBelts, setShowAllBelts] = useState(false);

  const titles: Record<GraduationDialogMode, string> = {
    promote: "Promover graduação",
    add: "Adicionar graduação",
    edit: "Editar graduação",
  };

  const defaults = useMemo((): GraduationEventFormValues => {
    if (initial) {
      return {
        resulting_belt_id: initial.resulting_belt_id,
        resulting_degree: initial.resulting_degree,
        graduated_at: initial.graduated_at,
        was_skip: initial.was_skip,
        skip_reason: initial.skip_reason ?? null,
        weight_kg: initial.weight_kg ?? null,
      };
    }
    return {
      resulting_belt_id: currentBeltId,
      resulting_degree: currentDegree,
      graduated_at: defaultGraduatedAtYmd(),
      was_skip: false,
      skip_reason: null,
      weight_kg: null,
    };
  }, [initial, currentBeltId, currentDegree]);

  const form = useForm<GraduationEventFormValues>({
    resolver: zodResolver(graduationEventSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaults);
      setShowAllBelts(false);
    }
  }, [open, defaults, form]);

  const beltId = form.watch("resulting_belt_id");
  const wasSkip = form.watch("was_skip");

  const catalog = useMemo(() => buildBeltCatalogMap(belts), [belts]);
  const selectedBelt = catalog.get(beltId);
  const currentBelt = catalog.get(currentBeltId);

  const visibleBelts = useMemo(() => {
    if (showAllBelts) return belts;
    return belts.filter((b) => b.kind === studentKind);
  }, [belts, showAllBelts, studentKind]);

  const adultBelts = visibleBelts.filter((b) => b.kind === "adult");
  const kidsBelts = visibleBelts.filter((b) => b.kind === "kids");

  const skipDetected =
    mode === "promote" &&
    currentBelt &&
    selectedBelt &&
    !isSameBelt(currentBelt, selectedBelt) &&
    isBeltSkip(currentBelt, selectedBelt);

  useEffect(() => {
    if (skipDetected && !wasSkip) {
      form.setValue("was_skip", true);
    }
  }, [skipDetected, wasSkip, form]);

  const degreeOptions =
    selectedBelt != null
      ? degreeOptionsForBelt(selectedBelt.slug, selectedBelt.kind)
      : [0, 1, 2, 3, 4];

  async function onSubmit(values: GraduationEventFormValues) {
    setLoading(true);
    try {
      let result;
      if (mode === "edit" && initial?.graduationId) {
        result = await updateGraduation(studentId, {
          ...values,
          graduationId: initial.graduationId,
        });
      } else if (mode === "add") {
        result = await addGraduation(studentId, values);
      } else {
        result = await promoteStudent(studentId, values);
      }

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof GraduationEventFormValues, {
              message: messages[0],
            });
          }
        }
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "edit"
          ? "Graduação actualizada."
          : "Graduação registada com sucesso.",
      );
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }

  const showKidsAdultBanner =
    studentKind === "kids" && ageYears !== null && ageYears >= 16;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            Registe faixa, grau, data e peso opcional. Alterações actualizam o
            estado actual do aluno.
          </DialogDescription>
        </DialogHeader>

        {showKidsAdultBanner ? (
          <div
            className="rounded-lg border border-[hsl(var(--status-pending)/0.35)] bg-[hsl(var(--status-pending)/0.1)] px-3 py-2 text-sm"
            role="status"
          >
            Aluno Kids com 16 anos ou mais — considere transição para faixa
            adulta (decisão do professor).
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all-belts"
                checked={showAllBelts}
                onCheckedChange={(c) => setShowAllBelts(c === true)}
              />
              <label htmlFor="show-all-belts" className="text-sm">
                Mostrar todas as faixas
              </label>
            </div>

            <FormField
              control={form.control}
              name="resulting_belt_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa resultante</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      const b = catalog.get(v);
                      if (b) {
                        const opts = degreeOptionsForBelt(b.slug, b.kind);
                        if (!opts.includes(form.getValues("resulting_degree"))) {
                          form.setValue("resulting_degree", opts[0] ?? 0);
                        }
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="min-h-11">
                        <SelectValue placeholder="Escolha a faixa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {adultBelts.length ? (
                        <SelectGroup>
                          <SelectLabel>Adulto</SelectLabel>
                          {adultBelts.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {beltLabelPt(b.slug, b.kind)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ) : null}
                      {kidsBelts.length ? (
                        <SelectGroup>
                          <SelectLabel>Kids</SelectLabel>
                          {kidsBelts.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {beltLabelPt(b.slug, b.kind)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ) : null}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resulting_degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grau resultante</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger className="min-h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {degreeOptions.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d === 0 ? "Sem grau" : `Grau ${d}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="graduated_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da graduação</FormLabel>
                  <FormControl>
                    <Input type="date" className="min-h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg) — opcional</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min={20}
                      max={250}
                      placeholder="Ex.: 72,5"
                      className="min-h-11"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>Entre 20,0 e 250,0 kg.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {skipDetected || wasSkip ? (
              <>
                <FormField
                  control={form.control}
                  name="was_skip"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Pulo de faixa</FormLabel>
                        {currentBelt && selectedBelt ? (
                          <FormDescription>
                            Está a saltar de{" "}
                            {beltLabelPt(currentBelt.slug, currentBelt.kind)} para{" "}
                            {beltLabelPt(selectedBelt.slug, selectedBelt.kind)}.
                            Justifique abaixo.
                          </FormDescription>
                        ) : null}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skip_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Justificativa do pulo</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Motivo do pulo de faixa…"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="min-h-11" disabled={loading}>
                {loading ? "A guardar…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
