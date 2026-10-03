"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createStudent, updateStudent } from "@/actions/students";
import { AdultOrangeBeltConfirmDialog } from "@/components/students/adult-orange-belt-confirm-dialog";
import { IsentoConfirmDialog } from "@/components/students/isento-confirm-dialog";
import { StudentFormProgress } from "@/components/students/student-form-progress";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { BeltCatalogRow, PlanCatalogRow } from "@/lib/data/students-catalog";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  applyActionFailureToForm,
  applyActionFieldErrors,
} from "@/lib/ui/action-field-errors";
import {
  formActionsClass,
  formCheckboxRowClass,
  formShellClass,
  primaryActionClass,
  secondaryActionClass,
} from "@/lib/ui/form-chrome";
import { mapStudentServerError } from "@/lib/students/action-errors";
import { beltLabelPt } from "@/lib/students/belt-labels";
import { academyStartStored } from "@/lib/students/academy-start";
import { isWhiteBeltSlug } from "@/lib/students/belt-kind";
import { degreeOptionsForBelt } from "@/lib/students/degree";
import { maskCpfInput, maskPhoneBrInput } from "@/lib/students/input-masks";
import {
  isOrangeFamilyKidsBeltSlug,
  pickDefaultPlanForStudentContext,
  planKindMatchesStudentContext,
} from "@/lib/students/plan-kind";
import {
  STUDENT_FORM_STEPS,
  studentFormStepIndexForFields,
  validateStudentFormStep,
} from "@/lib/validations/student-form-steps";
import {
  buildStudentFullFormSchema,
  type StudentFullFormValues,
} from "@/lib/validations/students";

type Props = {
  belts: BeltCatalogRow[];
  plans: PlanCatalogRow[];
  mode: "create" | "edit";
  studentId?: string;
  defaultValues: StudentFullFormValues;
  graduationEventId?: string | null;
};

const LAST_STEP = STUDENT_FORM_STEPS.length - 1;

export function StudentForm({
  belts,
  plans,
  mode,
  studentId,
  defaultValues,
  graduationEventId: _graduationEventId = null,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [exemptConfirmOpen, setExemptConfirmOpen] = useState(false);
  const [adultOrangeConfirm, setAdultOrangeConfirm] = useState<{
    beltId: string;
    label: string;
  } | null>(null);

  const schema = useMemo(
    () => buildStudentFullFormSchema(belts, plans),
    [belts, plans],
  );

  const form = useForm<StudentFullFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const kind = form.watch("kind");
  const beltId = form.watch("current_belt_id");
  const isExempt = form.watch("is_exempt");
  const stepId = STUDENT_FORM_STEPS[step]?.id;
  const isFirst = step === 0;
  const isLast = step === LAST_STEP;

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

  function applyBeltChange(beltIdNext: string) {
    form.setValue("current_belt_id", beltIdNext, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const b = belts.find((x) => x.id === beltIdNext);
    if (!b) return;
    if (isWhiteBeltSlug(b.slug)) {
      form.setValue("current_degree", 0);
    } else {
      const opts = degreeOptionsForBelt(b.slug, b.kind);
      form.setValue("current_degree", opts[0] ?? 0);
    }
  }

  const selectedBelt = belts.find((b) => b.id === beltId);

  const plansForKind = useMemo(
    () =>
      plans.filter((p) =>
        planKindMatchesStudentContext({
          planKind: p.kind,
          studentKind: kind,
          beltSlug: selectedBelt?.slug,
        }),
      ),
    [plans, kind, selectedBelt?.slug],
  );
  const isWhiteBelt = selectedBelt
    ? isWhiteBeltSlug(selectedBelt.slug)
    : false;

  useEffect(() => {
    if (isWhiteBelt) {
      form.setValue("current_degree", 0);
    }
  }, [isWhiteBelt, form]);

  useEffect(() => {
    if (!isWhiteBelt) return;
    const current = form.getValues("academy_start_date");
    if (!current || current.length < 4) return;
    const year = current.slice(0, 4);
    const next = academyStartStored(true, year, current);
    if (next !== current) {
      form.setValue("academy_start_date", next);
    }
  }, [isWhiteBelt, form]);

  useEffect(() => {
    const currentPlanId = form.getValues("plan_id");
    if (plansForKind.some((p) => p.id === currentPlanId)) return;
    const fallback = pickDefaultPlanForStudentContext(
      plans,
      kind,
      selectedBelt?.slug,
    );
    if (fallback) {
      form.setValue("plan_id", fallback.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, kind, plans, plansForKind, selectedBelt?.slug]);

  const degreeChoices = selectedBelt
    ? degreeOptionsForBelt(selectedBelt.slug, selectedBelt.kind)
    : [0, 1, 2, 3, 4];

  function syncKind(kindNext: "adult" | "kids" | "baby") {
    const beltKind = kindNext === "adult" ? "adult" : "kids";
    const b = belts.find((x) => x.kind === beltKind);
    const p = pickDefaultPlanForStudentContext(plans, kindNext, b?.slug);
    if (b) {
      form.setValue("current_belt_id", b.id);
      if (isWhiteBeltSlug(b.slug)) {
        form.setValue("current_degree", 0);
      } else {
        const opts = degreeOptionsForBelt(b.slug, b.kind);
        form.setValue("current_degree", opts[0] ?? 0);
      }
    }
    if (p) form.setValue("plan_id", p.id);
  }

  function goToStep(next: number) {
    setStep(Math.max(0, Math.min(LAST_STEP, next)));
  }

  function goToCompletedStep(next: number) {
    form.clearErrors();
    goToStep(next);
  }

  function advanceStep() {
    const result = validateStudentFormStep(schema, form.getValues(), step);
    if (!result.ok) {
      applyActionFieldErrors(form.setError, result.fieldErrors);
      return;
    }
    form.clearErrors();
    goToStep(step + 1);
  }

  function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLast) {
      advanceStep();
      return;
    }
    void form.handleSubmit(onSubmit, (errors) => {
      const next = studentFormStepIndexForFields(Object.keys(errors));
      if (next != null) goToStep(next);
    })(e);
  }

  async function onSubmit(values: StudentFullFormValues) {
    setLoading(true);
    try {
      const result =
        mode === "create"
          ? await createStudent(values)
          : await updateStudent(studentId!, values);

      if (!result.ok) {
        const { toastError } = applyActionFailureToForm(form.setError, result);
        if (result.fieldErrors) {
          const next = studentFormStepIndexForFields(
            Object.keys(result.fieldErrors),
          );
          if (next != null) goToStep(next);
        }
        if (toastError) toast.error(result.error);
        return;
      }
      toast.success(
        mode === "create" ? "Aluno registado com sucesso." : "Dados salvos.",
      );
      if (mode === "create") {
        router.push(ROUTES.alunos);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error(mapStudentServerError(e));
    } finally {
      setLoading(false);
    }
  }

  function leaveWithoutSave() {
    router.push(ROUTES.alunos);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={onFormSubmit}
        className={`${formShellClass} flex flex-col gap-6`}
      >
        <StudentFormProgress step={step} onSelectCompleted={goToCompletedStep} />

        {stepId === "identificacao" ? (
          <>
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    disabled={loading}
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v as "adult" | "kids" | "baby");
                      syncKind(v as "adult" | "kids" | "baby");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="adult">Adulto</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="baby">Baby (3–5 anos)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : null}

        {stepId === "faixa" ? (
          <>
            <FormField
              control={form.control}
              name="academy_start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isWhiteBelt
                      ? "Ano de entrada na academia"
                      : "Data de entrada na academia"}
                  </FormLabel>
                  <FormControl>
                    {isWhiteBelt ? (
                      <Input
                        type="number"
                        min={1990}
                        max={2100}
                        step={1}
                        disabled={loading}
                        placeholder="Ex.: 2025"
                        value={
                          field.value && field.value.length >= 4
                            ? field.value.slice(0, 4)
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          if (raw.length === 4) {
                            field.onChange(
                              academyStartStored(true, raw, field.value),
                            );
                          } else if (raw.length === 0) {
                            field.onChange("");
                          }
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    ) : (
                      <Input type="date" {...field} disabled={loading} />
                    )}
                  </FormControl>
                  {isWhiteBelt ? (
                    <p className="text-xs text-muted-foreground">
                      Só o ano. O relógio usa 1 de janeiro até haver graduação.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha" />
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

            {!isWhiteBelt ? (
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
                        <SelectTrigger>
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
            ) : null}

            {mode === "edit" ? (
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
                        disabled={loading}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Entre 20,0 e 250,0 kg. Guardado na graduação actual ao
                      salvar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </>
        ) : null}

        {stepId === "mensalidade" ? (
          <>
            <FormField
              control={form.control}
              name="is_exempt"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    formCheckboxRowClass,
                    "items-start rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900",
                  )}
                >
                  <FormControl>
                    <Checkbox
                      size="sm"
                      checked={field.value}
                      disabled={loading}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setExemptConfirmOpen(true);
                          return;
                        }
                        field.onChange(false);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Isento de mensalidade
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Não entra na lista de mensalidades nem aparece como
                      atrasado.
                    </p>
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
                      {plansForKind.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {plans.length === 0
                            ? "Não foram encontrados planos para esta academia. Recarregue a página; se continuar vazio, confira o vínculo conta/perfil em docs/security/rls.md."
                            : "Não há planos ativos para este tipo de aluno (Kids 1 / Kids 2 ou Adulto). Ative os planos nas configurações da conta."}
                        </p>
                      ) : (
                        <Select
                          disabled={loading}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha" />
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
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia de vencimento (1–28)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={28}
                          disabled={loading}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}
          </>
        ) : null}

        {stepId === "contactos" ? (
          <>
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(maskCpfInput(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      inputMode="tel"
                      placeholder="(00) 00000-0000"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(maskPhoneBrInput(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {kind === "kids" || kind === "baby" ? (
              <FormField
                control={form.control}
                name="guardian_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do responsável (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        inputMode="tel"
                        placeholder="(00) 00000-0000"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(maskPhoneBrInput(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Usado para enviar matrícula/termo ASLAM por WhatsApp a
                      menores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      disabled={loading}
                      autoComplete="email"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      className="min-h-[88px]"
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

        <div className={formActionsClass}>
          {!isFirst ? (
            <Button
              type="button"
              variant="outline"
              className={secondaryActionClass}
              disabled={loading}
              onClick={() => {
                form.clearErrors();
                goToStep(step - 1);
              }}
            >
              Voltar
            </Button>
          ) : null}
          {isFirst || isLast ? (
            <Button
              type="button"
              variant="outline"
              className={secondaryActionClass}
              disabled={loading}
              onClick={leaveWithoutSave}
            >
              Cancelar
            </Button>
          ) : null}
          {isLast ? (
            <Button
              type="submit"
              className={primaryActionClass}
              disabled={loading}
            >
              {loading
                ? "Salvando…"
                : mode === "create"
                  ? "Registar aluno"
                  : "Salvar"}
            </Button>
          ) : (
            <Button
              type="button"
              className={primaryActionClass}
              disabled={loading}
              onClick={advanceStep}
            >
              Continuar
            </Button>
          )}
        </div>

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
        <IsentoConfirmDialog
          open={exemptConfirmOpen}
          onOpenChange={setExemptConfirmOpen}
          onConfirm={() => {
            form.setValue("is_exempt", true, { shouldDirty: true });
          }}
        />
      </form>
    </Form>
  );
}
