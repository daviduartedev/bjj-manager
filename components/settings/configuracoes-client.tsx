"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updatePlan } from "@/actions/billing";
import { updateAccount } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
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
import type { SettingsPlanRow } from "@/lib/data/settings-page";
import { planKindLabels } from "@/lib/i18n/domain-enums";
import {
  parsePlanRowReaisToCents,
  planRowFormSchema,
  updateAccountSchema,
  type PlanRowFormValues,
  type UpdateAccountInput,
} from "@/lib/validations/settings";
import { cn } from "@/lib/utils";
import { Building2, Layers } from "lucide-react";

type Props = {
  initialAccountName: string;
  plans: SettingsPlanRow[];
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
                      className="min-h-11 touch-manipulation"
                      maxLength={200}
                      aria-required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="min-h-11 w-full touch-manipulation sm:w-auto"
              disabled={accountForm.formState.isSubmitting}
            >
              {accountForm.formState.isSubmitting ? "Salvando…" : "Salvar academia"}
            </Button>
          </form>
        </Form>
      </DashboardPanel>

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
            <p className="text-crm-sm text-muted-foreground" role="status">
              Nenhum plano encontrado. Saia e entre de novo para gerar os planos padrão da conta.
            </p>
          ) : null}
        </div>
      </DashboardPanel>
    </div>
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
        <form onSubmit={form.handleSubmit(submitPlan)} className="grid gap-4 md:max-w-2xl md:grid-cols-2">
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
                    className="min-h-11 touch-manipulation"
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
                    className="min-h-11 touch-manipulation tabular-nums"
                    placeholder="0,00"
                    aria-required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end">
            <Button
              type="submit"
              className="min-h-11 w-full touch-manipulation"
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
