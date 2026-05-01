"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";

import { quickUpdateStudent } from "@/actions/students";
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
import {
  Select,
  SelectContent,
  SelectItem,
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

  const kind = student?.kind ?? "adult";
  const schema = useMemo(
    () => buildQuickEditFormSchema(belts, plans, kind as StudentKind),
    [belts, plans, kind],
  );

  const defaults = useMemo((): QuickEditFormValues | null => {
    if (!student?.openPlan) return null;
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
      plan_id: student.openPlan.plan_id,
      due_day: student.openPlan.due_day,
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
  const selectedBelt =
    belts.find((b) => b.id === beltId) ??
    (student ? belts.find((b) => b.id === student.current_belt_id) : undefined);
  const degreeChoices = selectedBelt
    ? degreeOptionsForBelt(selectedBelt.slug, selectedBelt.kind)
    : [0, 1, 2, 3, 4];

  const beltsForKind = belts.filter((b) => b.kind === kind);
  const plansForKind = plans.filter((p) =>
    kind === "adult"
      ? p.kind === "adult"
      : p.kind === "kids_1" || p.kind === "kids_2",
  );

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
      toast.success("Alterações guardadas.");
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
                          Em avaliação — altere na ficha completa se necessário.
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
                          field.onChange(v);
                          const b = belts.find((x) => x.id === v);
                          if (b) {
                            const opts = degreeOptionsForBelt(b.slug, b.kind);
                            form.setValue("current_degree", opts[0] ?? 0);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="min-h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {beltsForKind.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {beltLabelPt(b.slug, b.kind)}
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
                  {loading ? "A guardar…" : "Guardar"}
                </Button>
                <Button variant="outline" className="min-h-11 w-full" asChild>
                  <Link href={routeAlunoEditar(student.id)} onClick={() => onOpenChange(false)}>
                    Editar ficha completa
                  </Link>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
