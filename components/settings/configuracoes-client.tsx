"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updatePlan } from "@/actions/billing";
import { updateAccount, updateAccountSlug, updateReceiver } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { formActionsClass, primaryActionClass } from "@/lib/ui/form-chrome";
import { EmptyState } from "@/components/layout/empty-state";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CnpjInput } from "@/components/settings/cnpj-input";
import { LogoUploader } from "@/components/settings/logo-uploader";
import { ModalitySwitchPanel } from "@/components/settings/modality-switch-panel";
import { SignatureUploader } from "@/components/settings/signature-uploader";
import type { SettingsPlanRow, SettingsReceiverRow } from "@/lib/data/settings-page";
import { MODALITY_LABELS, type AcademyModality } from "@/lib/modalities/catalog";
import { planKindLabels } from "@/lib/i18n/domain-enums";
import { storefrontPath, validateSlugChange } from "@/lib/storefront/storefront";
import {
  digitsOnly,
  maskCnpj,
  parsePlanRowReaisToCents,
  planRowFormSchema,
  updateAccountSchema,
  updateReceiverFormSchema,
  type PlanRowFormValues,
  type UpdateAccountInput,
  type UpdateReceiverFormValues,
} from "@/lib/validations/settings";
import { cn } from "@/lib/utils";
import { AlertTriangle, Building2, Layers, Receipt } from "lucide-react";

type Props = {
  initialAccountName: string;
  initialSlug: string;
  modality: AcademyModality;
  plans: SettingsPlanRow[];
  receiver: SettingsReceiverRow;
};

function reaisFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function ConfiguracoesClient(props: Props) {
  const router = useRouter();

  const accountForm = useForm<UpdateAccountInput>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: { name: props.initialAccountName },
    mode: "onSubmit",
  });

  useEffect(() => {
    accountForm.reset({ name: props.initialAccountName });
  }, [props.initialAccountName, accountForm]);

  async function submitAccount(values: UpdateAccountInput) {
    const r = await updateAccount(values);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Nome da academia atualizado.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <DashboardPanel
        icon={Building2}
        title="Academia"
        subtitle="Nome exibido no sistema e no cabeçalho"
      >
        <dl className="mx-auto mb-4 max-w-lg text-crm-sm">
          <dt className="font-medium">Modalidade</dt>
          <dd className="text-muted-foreground">{MODALITY_LABELS[props.modality]}</dd>
        </dl>
        <Form {...accountForm}>
          <form
            onSubmit={accountForm.handleSubmit(submitAccount)}
            className="mx-auto flex max-w-lg flex-col gap-4"
          >
            <FormField
              control={accountForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-wrap items-baseline gap-2">
                    Nome da academia
                    <span className="text-crm-xs font-normal text-muted-foreground">(obrigatório)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="organization"
                      maxLength={200}
                      aria-required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={formActionsClass}>
            <Button
              type="submit"
              className={primaryActionClass}
              disabled={accountForm.formState.isSubmitting}
            >
              {accountForm.formState.isSubmitting ? "Salvando…" : "Salvar academia"}
            </Button>
            </div>
          </form>
        </Form>
        <StorefrontAddressForm initialSlug={props.initialSlug} onSaved={() => router.refresh()} />
        <ModalitySwitchPanel current={props.modality} onSaved={() => router.refresh()} />
      </DashboardPanel>

      <ReceiverPanel receiver={props.receiver} onSaved={() => router.refresh()} />

      <DashboardPanel icon={Layers} title="Planos" subtitle="Preços e estado dos planos da conta">
        <div className="space-y-6">
          <p className="text-crm-sm text-muted-foreground">
            Tipos fixos (Kids 1, Kids 2, Adulto). Ajuste rótulo, valor e se o plano aceita novos vínculos.
          </p>
          <ul className="space-y-8">
            {props.plans.map((plan) => (
              <PlanEditorRow key={plan.id} plan={plan} onSaved={() => router.refresh()} />
            ))}
          </ul>
          {props.plans.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Nenhum plano encontrado"
              description="Saia e entre de novo para gerar os planos padrão da conta."
              className="rounded-none border-0 bg-transparent shadow-none"
            />
          ) : null}
        </div>
      </DashboardPanel>
    </div>
  );
}

function StorefrontAddressForm({
  initialSlug,
  onSaved,
}: {
  initialSlug: string;
  onSaved: () => void;
}) {
  const [next, setNext] = useState(initialSlug);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setNext(initialSlug);
    setConfirmed(false);
  }, [initialSlug]);

  const preview = validateSlugChange({
    next,
    current: initialSlug,
    takenByOthers: [],
    confirmed: true,
  });
  const nextSlug = preview.ok ? preview.slug : null;
  const changing = nextSlug !== null && nextSlug !== initialSlug;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const decision = validateSlugChange({
      next,
      current: initialSlug,
      takenByOthers: [],
      confirmed,
    });
    if (!decision.ok) {
      toast.error(decision.error);
      return;
    }

    setPending(true);
    const result = await updateAccountSlug({ next, confirmed });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Endereço da loja atualizado.");
    setConfirmed(false);
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-lg flex-col gap-4 border-t border-border pt-6">
      <div className="space-y-1">
        <p className="text-crm-sm font-medium">Endereço da loja</p>
        <p className="text-crm-sm text-muted-foreground">
          Endereço atual:{" "}
          <span className="font-medium text-foreground">{storefrontPath(initialSlug)}</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="storefront-slug">Novo endereço</Label>
        <Input
          id="storefront-slug"
          value={next}
          maxLength={200}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => {
            setNext(event.target.value);
            setConfirmed(false);
          }}
        />
        {changing && nextSlug ? (
          <p className="text-crm-xs text-muted-foreground">Vai ficar {storefrontPath(nextSlug)}</p>
        ) : null}
      </div>
      {changing ? (
        <div className="flex items-start gap-3">
          <Checkbox
            id="confirm-storefront-slug"
            checked={confirmed}
            disabled={pending}
            onCheckedChange={(value) => setConfirmed(value === true)}
          />
          <Label htmlFor="confirm-storefront-slug" className="cursor-pointer font-normal leading-snug">
            Confirmo a troca do endereço. O endereço anterior deixa de abrir.
          </Label>
        </div>
      ) : null}
      <div className={formActionsClass}>
        <Button type="submit" className={primaryActionClass} disabled={pending}>
          {pending ? "Salvando…" : "Salvar endereço"}
        </Button>
      </div>
    </form>
  );
}

function ReceiverPanel({
  receiver,
  onSaved,
}: {
  receiver: SettingsReceiverRow;
  onSaved: () => void;
}) {
  const form = useForm<UpdateReceiverFormValues>({
    resolver: zodResolver(updateReceiverFormSchema),
    defaultValues: {
      legalName: receiver.legal_name ?? "",
      cnpj: receiver.cnpj ? maskCnpj(receiver.cnpj) : "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    form.reset({
      legalName: receiver.legal_name ?? "",
      cnpj: receiver.cnpj ? maskCnpj(receiver.cnpj) : "",
    });
  }, [receiver.legal_name, receiver.cnpj, form]);

  const incomplete =
    !receiver.legal_name ||
    !receiver.cnpj ||
    !receiver.signature_path;

  async function submit(values: UpdateReceiverFormValues) {
    const cnpjDigits = digitsOnly(values.cnpj);
    const r = await updateReceiver({
      legalName: values.legalName,
      cnpj: cnpjDigits.length > 0 ? cnpjDigits : "",
    });
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Dados do recebedor atualizados.");
    onSaved();
  }

  return (
    <DashboardPanel
      icon={Receipt}
      title="Recebedor"
      subtitle="Razão social, CNPJ, logo e assinatura usados nos recibos e documentos"
    >
      {incomplete ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-md border border-[hsl(var(--status-pending)/0.35)] bg-[hsl(var(--status-pending)/0.08)] p-3 text-[hsl(var(--status-pending-foreground))]"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="text-crm-sm">
            <p className="font-medium">Configuração incompleta.</p>
            <p>
              Os recibos automáticos serão gerados com os campos preenchidos. Os campos em falta ficarão vazios.
            </p>
          </div>
        </div>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="grid gap-4 md:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="legalName"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex flex-wrap items-baseline gap-2">
                  Razão social
                  <span className="text-crm-xs font-normal text-muted-foreground">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="organization"
                    maxLength={200}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex flex-wrap items-baseline gap-2">
                  CNPJ
                  <span className="text-crm-xs font-normal text-muted-foreground">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <CnpjInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    className="tabular-nums"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={`md:col-span-2 ${formActionsClass}`}>
            <Button
              type="submit"
              className={primaryActionClass}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Salvando…" : "Salvar recebedor"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6">
        <Label className="mb-2 block text-crm-sm font-medium">Logo da academia</Label>
        <LogoUploader
          initialPath={receiver.logo_path}
          initialPreviewUrl={receiver.logo_preview_url}
        />
      </div>

      <div className="mt-6">
        <Label className="mb-2 block text-crm-sm font-medium">Assinatura digital</Label>
        <SignatureUploader
          initialPath={receiver.signature_path}
          initialPreviewUrl={receiver.signature_preview_url}
        />
      </div>
    </DashboardPanel>
  );
}

function PlanEditorRow(props: {
  plan: SettingsPlanRow;
  onSaved: () => void;
}) {
  const { plan } = props;
  const form = useForm<PlanRowFormValues>({
    resolver: zodResolver(planRowFormSchema),
    defaultValues: {
      name: plan.name,
      reaisStr: reaisFromCents(plan.price_cents),
    },
    mode: "onSubmit",
  });

  const [active, setActive] = useState(plan.active);
  const [pendingSave, startSave] = useTransition();
  const [pendingToggle, startToggle] = useTransition();

  useEffect(() => {
    form.reset({
      name: plan.name,
      reaisStr: reaisFromCents(plan.price_cents),
    });
    setActive(plan.active);
  }, [plan.name, plan.price_cents, plan.active, plan.id, form]);

  const kindLabel = planKindLabels[plan.kind];

  function submitPlan(values: PlanRowFormValues) {
    const cents = parsePlanRowReaisToCents(values.reaisStr);
    startSave(async () => {
      const r = await updatePlan({
        planId: plan.id,
        name: values.name.trim(),
        priceCents: cents,
        active,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Plano atualizado.");
      props.onSaved();
    });
  }

  function onActiveChecked(checked: boolean) {
    setActive(checked);
    startToggle(async () => {
      const r = await updatePlan({ planId: plan.id, active: checked });
      if (!r.ok) {
        toast.error(r.error);
        setActive(!checked);
        return;
      }
      toast.success(checked ? "Plano ativado." : "Plano desativado.");
      props.onSaved();
    });
  }

  return (
    <li className="rounded-xl border border-border bg-card/40 p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 border-b border-border/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-crm-xs font-medium uppercase tracking-wide text-muted-foreground">
            {kindLabel}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <Checkbox
            id={`active-${plan.id}`}
            checked={active}
            disabled={pendingToggle}
            onCheckedChange={(v) => onActiveChecked(v === true)}
            className={cn("size-5 touch-manipulation")}
          />
          <Label htmlFor={`active-${plan.id}`} className="cursor-pointer text-crm-sm font-medium leading-snug">
            Plano ativo (aceita novos vínculos)
          </Label>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitPlan)} className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex flex-wrap items-baseline gap-2">
                  Nome exibido
                  <span className="text-crm-xs font-normal text-muted-foreground">(obrigatório)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id={`name-${plan.id}`}
                    maxLength={120}
                    aria-required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reaisStr"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-wrap items-baseline gap-2">
                  Valor mensal (R$)
                  <span className="text-crm-xs font-normal text-muted-foreground">(obrigatório)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id={`price-${plan.id}`}
                    inputMode="decimal"
                    className="tabular-nums"
                    placeholder="0,00"
                    aria-required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={`md:col-span-2 ${formActionsClass}`}>
            <Button
              type="submit"
              className={primaryActionClass}
              disabled={pendingSave || pendingToggle || form.formState.isSubmitting}
            >
              {pendingSave ? "Salvando…" : "Salvar plano"}
            </Button>
          </div>
        </form>
      </Form>
    </li>
  );
}
