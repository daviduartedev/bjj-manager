"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building2, Check, ClipboardList, CreditCard, GraduationCap, LoaderCircle, MailCheck, ShieldCheck, Users } from "lucide-react";
import { useForm, type Control, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { registerAcademy } from "@/actions/register-academy";
import { CascaButton, CascaComboBoxField, CascaSelectField, CascaTextField, type CascaOption } from "@/components/ui/react-aria-controls";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ACADEMY_MODALITIES, MODALITY_LABELS, type AcademyModality } from "@/lib/modalities/catalog";
import { academyRegistrationSchema, academyOnboardingSchema, BRAZIL_STATES, BRAZIL_STATE_NAMES } from "@/lib/validations/academy-registration";
import { SUBSCRIPTION_PLANS, getSubscriptionPlan, type SubscriptionPlanId } from "@/lib/subscriptions/catalog";

import { ResendConfirmationForm } from "../resend-confirmation-form";

const wizardSchema = academyRegistrationSchema.extend({ onboarding: academyOnboardingSchema });
type RegistrationValues = z.infer<typeof wizardSchema>;

const STEPS = [
  { title: "A academia", description: "Identifique sua academia e onde ela fica. Esses dados compõem o perfil do seu espaço.", icon: Building2 },
  { title: "Alunos e rotina", description: "Conte como são suas turmas e o que precisa de atenção na gestão.", icon: Users },
  { title: "Responsável", description: "Escolha o acesso do responsável pela academia. O próximo passo será confirmar o e-mail.", icon: ShieldCheck },
];
const STEP_FIELDS: FieldPath<RegistrationValues>[][] = [
  ["academyName", "modality", "onboarding.state", "onboarding.city", "onboarding.cityId", "onboarding.stage"],
  ["onboarding.studentRange", "onboarding.audiences", "onboarding.priorities"],
  ["displayName", "email", "password"],
];
const STATE_OPTIONS: CascaOption[] = BRAZIL_STATES.map((state) => ({
  id: state,
  label: `${state} — ${BRAZIL_STATE_NAMES[state]}`,
}));
const MODALITY_OPTIONS: CascaOption[] = ACADEMY_MODALITIES.map((modality) => ({
  id: modality,
  label: MODALITY_LABELS[modality],
}));
const MODALITY_HINT: Record<AcademyModality, string> = {
  jiu_jitsu: "Adulto e infantil, com faixas e graduações.",
  boxing: "Adultos de 18 anos ou mais, sem faixa.",
  judo: "Adultos de 18 anos ou mais, com o catálogo CBJ.",
  muay_thai: "Adultos de 18 anos ou mais, com os 19 khan da CBMTT.",
};
const AUDIENCES = [
  { value: "baby", label: "Baby", description: "Primeiros passos no tatame", emoji: "🐣" },
  { value: "kids", label: "Kids", description: "Crianças e adolescentes", emoji: "🥋" },
  { value: "adult", label: "Adultos", description: "Iniciantes e graduados", emoji: "👊" },
] as const;
const PRIORITIES = [
  { value: "students", label: "Cadastro dos alunos", icon: Users },
  { value: "attendance", label: "Aulas e presença", icon: ClipboardList },
  { value: "graduation", label: "Faixas e graduação", icon: GraduationCap },
  { value: "billing", label: "Mensalidades", icon: CreditCard },
] as const;

function TextField({ control, name, label, placeholder, autoComplete, type = "text", description }: {
  control: Control<RegistrationValues>;
  name: "academyName" | "displayName" | "email" | "password";
  label: string;
  placeholder?: string;
  autoComplete?: string;
  type?: string;
  description?: string;
}) {
  return <FormField control={control} name={name} render={({ field, fieldState }) => (
    <CascaTextField
      name={field.name}
      label={label}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      maxLength={type === "password" ? 72 : 80}
      description={description}
      errorMessage={fieldState.error?.message}
      isInvalid={fieldState.invalid}
      isRequired
    />
  )} />;
}

export function RegisterForm({ initialPlanId = "essencial" }: { initialPlanId?: SubscriptionPlanId }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState<{ message: string; email: string } | null>(null);
  const [municipalities, setMunicipalities] = useState<CascaOption[]>([]);
  const [municipalitiesLoading, setMunicipalitiesLoading] = useState(false);
  const [municipalitiesError, setMunicipalitiesError] = useState<string | null>(null);
  const [municipalitiesRetry, setMunicipalitiesRetry] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const hasMounted = useRef(false);
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      academyName: "", displayName: "", email: "", password: "",
      subscriptionPlanId: initialPlanId,
      modality: "" as RegistrationValues["modality"],
      onboarding: { city: "", cityId: "", state: "" as RegistrationValues["onboarding"]["state"], audiences: [], priorities: [] },
    },
    mode: "onSubmit",
  });

  const selectedState = form.watch("onboarding.state");
  const selectedPlan = getSubscriptionPlan(form.watch("subscriptionPlanId")) ?? SUBSCRIPTION_PLANS[0];
  const selectedModality = form.watch("modality");
  const adultOnly = Boolean(selectedModality) && selectedModality !== "jiu_jitsu";
  const selectedCity = form.watch("onboarding.city");
  const selectedCityId = form.watch("onboarding.cityId");
  const cityQuery = selectedCity.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const cityOptions = cityQuery.length < 2
    ? []
    : municipalities.filter(({ label }) => label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").includes(cityQuery));

  useEffect(() => {
    if (!selectedState) {
      setMunicipalities([]);
      setMunicipalitiesError(null);
      setMunicipalitiesLoading(false);
      return;
    }

    const controller = new AbortController();
    setMunicipalities([]);
    setMunicipalitiesError(null);
    setMunicipalitiesLoading(true);

    void fetch(`/api/locations/states/${selectedState}/cities`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { municipalities?: { id: string; name: string }[]; error?: string };
        if (!response.ok || !Array.isArray(payload.municipalities)) {
          throw new Error(payload.error || "Não foi possível carregar as cidades agora. Tente novamente.");
        }
        return payload.municipalities.map(({ id, name }) => ({ id: String(id), label: name }));
      })
      .then(setMunicipalities)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMunicipalitiesError(error instanceof Error ? error.message : "Não foi possível carregar as cidades agora. Tente novamente.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setMunicipalitiesLoading(false);
      });

    return () => controller.abort();
  }, [selectedState, municipalitiesRetry]);

  useEffect(() => {
    if (hasMounted.current) heading.current?.focus();
    hasMounted.current = true;
  }, [step, waiting]);

  async function submit(values: RegistrationValues) {
    setLoading(true);
    try {
      const result = await registerAcademy(values);
      if (result.ok) {
        form.resetField("password");
        setWaiting({ message: result.message, email: values.email });
      } else if ("message" in result) {
        toast.error(result.message);
      } else {
        const fields = Object.keys(result.fieldErrors);
        if (fields.includes("academyName") || fields.includes("modality") || fields.includes("onboarding")) setStep(0);
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages[0]) form.setError(key as FieldPath<RegistrationValues>, { message: messages[0] });
        }
      }
    } catch {
      toast.error("Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function goToStep(target: number) {
    if (loading) return;
    if (target > step) {
      for (let index = 0; index < target; index++) {
        if (!(await form.trigger(STEP_FIELDS[index], { shouldFocus: true }))) {
          setStep(index);
          return;
        }
      }
    }
    setStep(target);
  }

  async function advance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (step < 2) {
      await goToStep(step + 1);
      return;
    }
    await form.handleSubmit(submit, (errors) => {
        if (errors.academyName || errors.modality || errors.onboarding?.city || errors.onboarding?.cityId || errors.onboarding?.state || errors.onboarding?.stage) setStep(0);
      else if (errors.onboarding) setStep(1);
    })(event);
  }

  return (
    <main className="mx-auto w-full max-w-[1320px] text-foreground">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Nova academia</p>
        <p className="text-sm text-muted-foreground">Já tem uma conta? <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Entrar</Link></p>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-primary bg-secondary px-6 py-7 text-secondary-foreground sm:px-9">
        <div className="flex items-center gap-4">
          <Building2 className="size-9 shrink-0 text-secondary-foreground/70" aria-hidden />
          <div><h1 className="!text-2xl !font-medium !text-secondary-foreground">Configurar academia</h1>
            <p className="mt-1 text-sm text-secondary-foreground/60">Vamos preparar seu espaço no Casca.</p>
          </div>
        </div>
        <span className="text-sm text-secondary-foreground/70">{waiting ? "Confirmação de e-mail" : `Etapa ${step + 1} de 3`}</span>
      </header>
      <div className="border-x border-b border-border bg-card">
          <nav aria-label="Etapas do cadastro">
            <ol className="grid grid-cols-3 border-b border-border">
              {STEPS.map(({ title, icon: Icon }, index) => {
                const complete = waiting || index < step;
                const active = !waiting && index === step;
                return <li key={title} aria-current={active ? "step" : undefined}>
                  <button type="button" disabled={loading || Boolean(waiting)}
                    onClick={() => void goToStep(index)}
                    className={cn("flex min-h-20 w-full flex-col items-center justify-center gap-2 border-b-2 px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:gap-3 sm:text-sm",
                      active ? "border-primary bg-primary/5 font-semibold text-primary" : "border-transparent text-muted-foreground hover:bg-background")}>
                    {complete ? <Check className="size-5 text-primary" aria-hidden /> : <Icon className="size-5" aria-hidden />}
                    <span>{index + 1}. {title}</span>
                  </button>
                </li>;
              })}
            </ol>
          </nav>
          {waiting ? (
            <section className="mx-auto max-w-2xl px-6 py-12 sm:px-10 lg:py-20">
              <MailCheck className="mb-6 size-12 text-primary" aria-hidden />
              <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold tracking-tight outline-none">Agora, confira seu e-mail.</h2>
              <p role="status" className="mt-4 leading-7 text-muted-foreground">{waiting.message}</p>
              <div className="mt-8"><ResendConfirmationForm defaultEmail={waiting.email} emailHidden /></div>
              <Link href="/login" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">Voltar ao login</Link>
            </section>
          ) : (
            <Form {...form}>
              <form onSubmit={advance} noValidate>
                <div className="grid gap-4 border-b border-border bg-primary/5 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] sm:items-center sm:px-9">
                  <div><p className="font-semibold">3 dias para conhecer o Casca</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Após confirmar o e-mail, informe o cartão na adesão. Os 3 dias começam após concluir a adesão; depois, cobrança automática de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedPlan.priceCents / 100)} por mês. Cancele antes do fim do teste para não ser cobrado.</p></div>
                  <FormField control={form.control} name="subscriptionPlanId" render={({ field, fieldState }) => <CascaSelectField label="Plano do Casca" value={field.value} onChange={field.onChange} options={SUBSCRIPTION_PLANS.map(plan => ({ id: plan.id, label: `${plan.name} · até ${plan.activeStudentLimit} alunos · R$ ${plan.priceCents / 100}/mês` }))} isRequired isInvalid={fieldState.invalid} errorMessage={fieldState.error?.message} isDisabled={loading} />} />
                </div>
                <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
                  <section className="border-b border-border p-6 sm:p-9 lg:border-b-0 lg:border-r">
                    <h2 ref={heading} tabIndex={-1} className="text-xl font-medium outline-none">{STEPS[step].title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{STEPS[step].description}</p>
                  </section>
                  <fieldset disabled={loading} aria-label={STEPS[step].title} className="min-w-0 p-6 sm:p-9">
                  {form.formState.errors.onboarding?.message && <p role="alert" className="mb-4 text-sm text-destructive">{form.formState.errors.onboarding.message}</p>}

                  {step === 0 && <div className="space-y-8">
                    <section className="space-y-5">
                      <TextField control={form.control} name="academyName" label="Nome da academia" placeholder="Ex.: Academia Caminho Suave" autoComplete="organization" />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField control={form.control} name="onboarding.state" render={({ field, fieldState }) => <CascaSelectField
                          label="Estado" value={field.value ?? ""} options={STATE_OPTIONS} placeholder="Selecione o estado"
                          onChange={(state) => {
                            field.onChange(state);
                            form.setValue("onboarding.city", "", { shouldDirty: true });
                            form.setValue("onboarding.cityId", "", { shouldDirty: true });
                            form.clearErrors(["onboarding.state", "onboarding.city", "onboarding.cityId"]);
                          }} isRequired isInvalid={fieldState.invalid} errorMessage={fieldState.error?.message}
                        />} />
                        <FormField control={form.control} name="onboarding.city" render={({ field, fieldState }) => {
                          const cityIdError = form.getFieldState("onboarding.cityId").error?.message;
                          return <div className="space-y-2">
                            <CascaComboBoxField label="Cidade" inputValue={field.value ?? ""} selectedKey={selectedCityId ?? ""}
                              options={cityOptions} placeholder={selectedState ? "Digite para buscar sua cidade" : "Selecione primeiro o estado"}
                              emptyMessage={cityQuery.length < 2 ? "Digite ao menos duas letras para buscar." : "Nenhuma cidade encontrada para esta busca."}
                              onInputChange={(city) => {
                                field.onChange(city);
                                form.setValue("onboarding.cityId", "", { shouldDirty: true });
                                form.clearErrors(["onboarding.city", "onboarding.cityId"]);
                              }}
                              onSelectionChange={(key) => {
                                const option = municipalities.find(({ id }) => id === key);
                                field.onChange(option?.label ?? "");
                                form.clearErrors(["onboarding.city", "onboarding.cityId"]);
                                form.setValue("onboarding.cityId", option?.id ?? "", { shouldDirty: true, shouldValidate: true });
                              }}
                              inputRef={field.ref} isRequired isDisabled={!selectedState || municipalitiesLoading || Boolean(municipalitiesError)}
                              isInvalid={fieldState.invalid || Boolean(cityIdError)} errorMessage={fieldState.error?.message ?? cityIdError}
                              description={selectedState ? "Escolha uma cidade da lista para validar o município." : "As cidades aparecem depois da seleção do estado."}
                            />
                            {municipalitiesLoading && <p role="status" aria-live="polite" className="text-crm-sm text-muted-foreground">Carregando cidades…</p>}
                            {municipalitiesError && <div className="flex flex-wrap items-center gap-3" role="alert"><p className="text-crm-sm text-destructive">{municipalitiesError}</p><CascaButton type="button" variant="outline" className="min-h-9 px-3" onPress={() => setMunicipalitiesRetry(value => value + 1)}>Tentar novamente</CascaButton></div>}
                          </div>;
                        }} />
                      </div>
                    </section>
                    <FormField control={form.control} name="onboarding.stage" render={({ field }) => <FormItem>
                      <fieldset><legend className="mb-4 text-base font-semibold">Em que momento está a academia?</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[{ value: "planning", label: "Estou começando", detail: "Organizando a abertura e as primeiras turmas.", emoji: "🌱" }, { value: "operating", label: "Já está funcionando", detail: "Já tenho alunos e uma rotina de treinos.", emoji: "🥋" }].map(option => (
                            <label key={option.value} className={cn("flex cursor-pointer items-start gap-3 rounded-md border p-4 focus-within:ring-2 focus-within:ring-ring", field.value === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-background")}>
                              <input ref={field.ref} type="radio" name={field.name} value={option.value} checked={field.value === option.value} onChange={() => field.onChange(option.value)} className="mt-1 size-4 shrink-0 accent-primary" />
                              <span><span className="block text-base font-medium"><span aria-hidden className="mr-2">{option.emoji}</span>{option.label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{option.detail}</span></span>
                            </label>
                          ))}
                        </div>
                      </fieldset><FormMessage />
                    </FormItem>} />
                    <FormField control={form.control} name="modality" render={({ field, fieldState }) => <CascaSelectField
                      label="Modalidade" value={field.value ?? ""} options={MODALITY_OPTIONS} placeholder="Selecione a modalidade"
                      onChange={(value) => {
                        const next = value as AcademyModality;
                        field.onChange(next);
                        if (next !== "jiu_jitsu") form.setValue("onboarding.audiences", ["adult"], { shouldDirty: true, shouldValidate: true });
                      }}
                      isRequired isInvalid={fieldState.invalid} errorMessage={fieldState.error?.message}
                      className="max-w-md"
                    />} />
                    {selectedModality ? <p className="text-sm text-muted-foreground">{MODALITY_HINT[selectedModality]}</p> : null}
                  </div>}

                  {step === 1 && <div className="space-y-7">
                    <FormField control={form.control} name="onboarding.studentRange" render={({ field, fieldState }) => <FormItem>
                      <CascaSelectField label="Quantos alunos treinam com você hoje?" value={field.value ?? ""} onChange={field.onChange}
                        options={[{ id: "starting", label: "Ainda não tenho alunos" }, { id: "1-30", label: "1 a 30 alunos" }, { id: "31-100", label: "31 a 100 alunos" }, { id: "101-200", label: "101 a 200 alunos" }, { id: "201+", label: "Mais de 200 alunos" }]}
                        placeholder="Selecione uma faixa aproximada" isRequired isInvalid={fieldState.invalid} errorMessage={fieldState.error?.message} />
                    </FormItem>} />
                    <FormField control={form.control} name="onboarding.audiences" render={({ field }) => <FormItem>
                      <fieldset><legend className="mb-1 text-base font-semibold">Quem treina ou vai treinar na academia?</legend>
                        <p className="mb-4 text-sm text-muted-foreground">{adultOnly ? "Esta modalidade atende adultos de 18 anos ou mais." : "Selecione todos os públicos que fazem parte do seu espaço."}</p>
                        <div className="grid gap-3 sm:grid-cols-3">{AUDIENCES.filter((option) => !adultOnly || option.value === "adult").map(option => (
                          <label key={option.value} className={cn("relative flex cursor-pointer items-start gap-3 rounded-md border p-4 focus-within:ring-2 focus-within:ring-ring", field.value.includes(option.value) ? "border-primary bg-primary/5" : "border-border hover:bg-background")}>
                            <input ref={field.ref} type="checkbox" name={field.name} checked={field.value.includes(option.value)} onChange={event => field.onChange(event.target.checked ? [...field.value, option.value] : field.value.filter(value => value !== option.value))} className="mt-1 size-4 shrink-0 accent-primary" />
                            <span><span className="flex items-center gap-2 font-medium"><span aria-hidden className="text-xl">{option.emoji}</span>{option.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{adultOnly ? "18 anos ou mais" : option.description}</span></span>
                          </label>
                        ))}</div>
                      </fieldset><FormMessage />
                    </FormItem>} />
                    <FormField control={form.control} name="onboarding.priorities" render={({ field }) => <FormItem>
                      <fieldset><legend className="mb-4 text-base font-semibold">O que você mais quer organizar?</legend>
                        <div className="grid gap-3 sm:grid-cols-2">{PRIORITIES.map(({ value, label, icon: Icon }) => (
                          <label key={value} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-md border p-4 focus-within:ring-2 focus-within:ring-ring", field.value.includes(value) ? "border-primary bg-primary/5" : "border-border hover:bg-background")}>
                            <input ref={field.ref} type="checkbox" name={field.name} checked={field.value.includes(value)} onChange={event => field.onChange(event.target.checked ? [...field.value, value] : field.value.filter(item => item !== value))} className="size-4 shrink-0 accent-primary" />
                            <Icon className="size-5 shrink-0 text-primary" aria-hidden /><span className="text-sm font-medium">{label}</span>
                          </label>
                        ))}</div>
                      </fieldset><FormMessage />
                    </FormItem>} />
                  </div>}

                  {step === 2 && <div className="space-y-7">
                    <TextField control={form.control} name="displayName" label="Seu nome" placeholder="Como você prefere ser chamado?" autoComplete="name" />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField control={form.control} name="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email" />
                      <TextField control={form.control} name="password" label="Crie uma senha" type="password" autoComplete="new-password" description="Use pelo menos 15 caracteres. Uma frase-senha funciona bem; não precisa misturar símbolos e números." />
                    </div>
                    <div className="rounded-md border border-border bg-background p-5">
                      <p className="flex items-center gap-2 font-semibold"><Building2 className="size-5 text-primary" aria-hidden />{form.getValues("academyName")}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{form.getValues("onboarding.city")} / {form.getValues("onboarding.state")} · {selectedModality ? MODALITY_LABELS[selectedModality] : "Modalidade não escolhida"}</p>
                      <p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">Depois de confirmar o e-mail neste navegador, você conclui a adesão ao plano {selectedPlan.name} com cartão para iniciar o teste de 3 dias. {selectedModality === "jiu_jitsu" ? "A academia começa com os planos de mensalidade Baby, Kids 1, Kids 2 e Adulto." : "O atendimento é adulto, de 18 anos ou mais. A rotina não abre Kids nem Baby."}</p>
                    </div>
                  </div>}
                  </fieldset>
                </div>
                <footer className="flex items-center justify-between gap-3 border-t border-border px-6 py-5 sm:px-9">
                  <CascaButton type="button" variant="ghost" isDisabled={loading || step === 0} onPress={() => setStep(step - 1)}><ArrowLeft aria-hidden />Voltar</CascaButton>
                  <CascaButton type="submit" isDisabled={loading} className="px-6">
                    {loading && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />}{loading ? "Criando…" : step < 2 ? "Continuar" : "Criar academia"}{!loading && <ArrowRight aria-hidden />}
                  </CascaButton>
                </footer>
              </form>
            </Form>
          )}
      </div>
    </main>
  );
}
