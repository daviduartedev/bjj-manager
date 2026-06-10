"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";

import { quickUpdateStudent } from "@/actions/students";
import { AdultOrangeBeltConfirmDialog } from "@/components/students/adult-orange-belt-confirm-dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BeltCatalogRow, PlanCatalogRow } from "@/lib/data/students-catalog";
import type { ListStudentRow } from "@/lib/data/students-list";
import { routeAlunoEditar } from "@/lib/routes";
import { mapStudentServerError } from "@/lib/students/action-errors";
import { beltLabelPt } from "@/lib/students/belt-labels";
import { degreeOptionsForBelt } from "@/lib/students/degree";
import type { StudentKind } from "@/lib/students/degree";
import {
  isOrangeFamilyKidsBeltSlug,
  pickDefaultPlanForStudentContext,
  planKindMatchesStudentContext,
} from "@/lib/students/plan-kind";
import {
  buildQuickEditFormSchema,
  type QuickEditFormValues,
} from "@/lib/validations/students";

type Props = {
  student: ListStudentRow | null;
  belts: BeltCatalogRow[];
  plans: PlanCatalogRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuickEditDialog({
  student,
  belts,
  plans,
  open,
  onOpenChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [adultOrangeConfirm, setAdultOrangeConfirm] = useState<{
    beltId: string;
    label: string;
  } | null>(null);

  const kind = student?.kind ?? "adult";
  const schema = useMemo(
    () => buildQuickEditFormSchema(belts, plans, kind as StudentKind),
    [belts, plans, kind],
  );

  const defaults = useMemo((): QuickEditFormValues | null => {
    if (!student) return null;
    const st = student.status;
    const statusNorm: QuickEditFormValues["status"] =
      st === "active" ||
      st === "inactive" ||
      st === "paused" ||
      st === "trial"
        ? st
        : "active";
    return {
      status: statusNorm,
      is_exempt: student.is_exempt,
      plan_id: student.openPlan?.plan_id ?? "",
      due_day: student.openPlan?.due_day ?? 10,
      current_belt_id: student.current_belt_id,
      current_degree: student.current_degree,
    };
  }, [student]);

  const form = useForm<QuickEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults ?? undefined,
  });

  useEffect(() => {
    if (defaults && open) {
      form.reset(defaults);
    }
  }, [defaults, open, form]);

  const beltId = form.watch("current_belt_id");
  const isExempt = form.watch("is_exempt");
  const selectedBelt =
    belts.find((b) => b.id === beltId) ??
    (student ? belts.find((b) => b.id === student.current_belt_id) : undefined);
  const degreeChoices = selectedBelt
    ? degreeOptionsForBelt(selectedBelt.slug, selectedBelt.kind)
    : [0, 1, 2, 3, 4];

  const { adultBelts, orangeJuvenileBelts, kidsBelts } = useMemo(() => {
    const byOrdinal = (a: BeltCatalogRow, b: BeltCatalogRow) =>
      a.ordinal - b.ordinal;
    return {
      adultBelts: belts.filter((b) => b.kind === "adult").sort(byOrdinal),
      orangeJuvenileBelts: belts
        .filter(
          (b) => b.kind === "kids" && isOrangeFamilyKidsBeltSlug(b.slug),
        )
        .sort(byOrdinal),
      kidsBelts: belts.filter((b) => b.kind === "kids").sort(byOrdinal),
    };
  }, [belts]);
  const plansForKind = plans.filter((p) =>
    planKindMatchesStudentContext({
      planKind: p.kind,
      studentKind: kind as StudentKind,
      beltSlug: selectedBelt?.slug,
    }),
  );

  useEffect(() => {
    if (!open || !defaults) return;
    const currentPlanId = form.getValues("plan_id");
    if (plansForKind.some((p) => p.id === currentPlanId)) return;
    const fallback = pickDefaultPlanForStudentContext(
      plans,
      kind as StudentKind,
      selectedBelt?.slug,
    );
    if (fallback) {
      form.setValue("plan_id", fallback.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [defaults, form, kind, open, plans, plansForKind, selectedBelt?.slug]);

  function applyBeltChange(beltIdNext: string) {
    form.setValue("current_belt_id", beltIdNext, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const b = belts.find((x) => x.id === beltIdNext);
    if (b) {
      const opts = degreeOptionsForBelt(b.slug, b.kind);
      form.setValue("current_degree", opts[0] ?? 0);
    }
  }

  async function onSubmit(values: QuickEditFormValues) {
    if (!student) return;
    setLoading(true);
    try {
      const result = await quickUpdateStudent(student.id, kind as StudentKind, values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, msgs] of Object.entries(result.fieldErrors)) {
            form.setError(key as keyof QuickEditFormValues, {
              message: msgs[0],
            });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success("Alterações salvas.");
      onOpenChange(false);
    } catch (e) {
      toast.error(mapStudentServerError(e));
    } finally {
      setLoading(false);
    }
  }

  const trialLocked = student?.status === "trial";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edição rápida</DialogTitle>
          <DialogDescription>
            Ajuste situação, plano, vencimento, faixa e grau. Para nome e contactos,
            use a ficha completa.
          </DialogDescription>
        </DialogHeader>

        {!student || !defaults ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar dados para edição rápida.
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação</FormLabel>
                    {trialLocked ? (
                      <>
                        <input type="hidden" {...field} />
                        <p className="text-sm text-muted-foreground">
                          Em avaliação; edite na ficha completa se precisar.
                        </p>
                      </>
                    ) : (
                      <Select
                        disabled={loading}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="min-h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="paused">Pausado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_exempt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 rounded-lg border border-border/60 bg-muted/15 p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        disabled={loading}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Isento de mensalidade</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {!isExempt ? (
                <>
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select
                      disabled={loading}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="min-h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plansForKind.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
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
                name="due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de vencimento</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={1}
                        max={28}
                        disabled={loading}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="current_belt_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa</FormLabel>
                      <Select
                        disabled={loading}
                        value={field.value}
                        onValueChange={(v) => {
                          const b = belts.find((x) => x.id === v);
                          if (!b) return;
                          if (
                            kind === "adult" &&
                            b.kind === "kids" &&
                            isOrangeFamilyKidsBeltSlug(b.slug)
                          ) {
                            const prev = belts.find((x) => x.id === field.value);
                            if (!isOrangeFamilyKidsBeltSlug(prev?.slug)) {
                              setAdultOrangeConfirm({
                                beltId: v,
                                label: beltLabelPt(b.slug, b.kind),
                              });
                              return;
                            }
                          }
                          applyBeltChange(v);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="min-h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kind === "adult" ? (
                            <>
                              <SelectGroup>
                                <SelectLabel>Faixas adulto</SelectLabel>
                                {adultBelts.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {beltLabelPt(b.slug, b.kind)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              {orangeJuvenileBelts.length > 0 ? (
                                <SelectGroup>
                                  <SelectLabel className="text-primary">
                                    Laranja (juvenil) — tipo Adulto
                                  </SelectLabel>
                                  {orangeJuvenileBelts.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                      {beltLabelPt(b.slug, b.kind)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ) : null}
                            </>
                          ) : (
                            <SelectGroup>
                              <SelectLabel>Faixas kids</SelectLabel>
                              {kidsBelts.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {beltLabelPt(b.slug, b.kind)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="current_degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grau</FormLabel>
                      <Select
                        disabled={loading}
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger className="min-h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {degreeChoices.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button type="submit" className="min-h-11 w-full" disabled={loading}>
                  {loading ? "Salvando…" : "Salvar"}
                </Button>
                <Button variant="outline" className="min-h-11 w-full" asChild>
                  <Link href={routeAlunoEditar(student.id)} onClick={() => onOpenChange(false)}>
                    Editar ficha completa
                  </Link>
                </Button>
              </DialogFooter>

              <AdultOrangeBeltConfirmDialog
                open={adultOrangeConfirm !== null}
                onOpenChange={(open) => {
                  if (!open) setAdultOrangeConfirm(null);
                }}
                beltLabel={adultOrangeConfirm?.label ?? ""}
                onConfirm={() => {
                  if (adultOrangeConfirm) {
                    applyBeltChange(adultOrangeConfirm.beltId);
                  }
                }}
              />
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
