"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updatePlan } from "@/actions/billing";
import {
  updateAccount,
  updateAccountSlug,
  updateReceiver,
  updateStorefrontPublication,
  updateStorefrontTheme,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { cn } from "@/lib/utils";
import { applyActionFailureToForm } from "@/lib/ui/action-field-errors";
import {
  formActionsClass,
  formCheckboxRowClass,
  formShellClass,
  primaryActionClass,
  secondaryActionClass,
} from "@/lib/ui/form-chrome";
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
import { ReadinessCriterionPanel } from "@/components/settings/readiness-criterion-panel";
import type { SettingsPlanRow, SettingsReceiverRow } from "@/lib/data/settings-page";
import { MODALITY_LABELS, type AcademyModality } from "@/lib/modalities/catalog";
import { planKindLabels } from "@/lib/i18n/domain-enums";
import { normalizePhoneE164 } from "@/lib/documents/whatsapp";
import {
  canCopyStorefrontLink,
  canPublishStorefront,
  parseStorefrontTheme,
  resolveStorefrontAccess,
  STOREFRONT_THEME_DEFAULTS,
  storefrontPath,
  storefrontThemeDefaults,
  storefrontThemeStyle,
  validateSlugChange,
  type StorefrontTheme,
  type StorefrontThemeKey,
} from "@/lib/storefront/storefront";
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
import { AlertTriangle, Building2, Layers, Receipt } from "lucide-react";

type Props = {
  initialAccountName: string;
  modality: AcademyModality;
  plans: SettingsPlanRow[];
  receiver: SettingsReceiverRow;
  readinessKidsDegreeMonths: number | null;
  readinessConfirmedAt: string | null;
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
      const { toastError } = applyActionFailureToForm(accountForm.setError, r);
      if (toastError) toast.error(r.error);
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
        <dl className="mb-4 text-crm-sm">
          <dt className="font-medium">Modalidade</dt>
          <dd className="text-muted-foreground">{MODALITY_LABELS[props.modality]}</dd>
        </dl>
        <Form {...accountForm}>
          <form
            onSubmit={accountForm.handleSubmit(submitAccount)}
            className={`${formShellClass} flex flex-col gap-4`}
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
        <ModalitySwitchPanel current={props.modality} onSaved={() => router.refresh()} />
      </DashboardPanel>

      <ReadinessCriterionPanel
        kidsDegreeMonths={props.readinessKidsDegreeMonths}
        confirmedAt={props.readinessConfirmedAt}
      />

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

export function CatalogoClient(props: {
  initialAccountName: string;
  initialSlug: string;
  initialStorefrontWhatsapp: string | null;
  initialStorefrontPublished: boolean;
  initialStorefrontTheme: unknown;
  storefrontUrl: string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <StorefrontAddressForm initialSlug={props.initialSlug} onSaved={() => router.refresh()} />
      <StorefrontPublicationForm
        initialSlug={props.initialSlug}
        initialWhatsapp={props.initialStorefrontWhatsapp}
        initialPublished={props.initialStorefrontPublished}
        storefrontUrl={props.storefrontUrl}
        onSaved={() => router.refresh()}
      />
      <StorefrontThemeForm
        academyName={props.initialAccountName}
        initialTheme={props.initialStorefrontTheme}
        onSaved={() => router.refresh()}
      />
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
    toast.success("Endereço do catálogo de produtos atualizado.");
    setConfirmed(false);
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
      <div className="space-y-1">
        <p className="text-crm-sm font-medium">Endereço do catálogo de produtos</p>
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

function StorefrontPublicationForm({
  initialSlug,
  initialWhatsapp,
  initialPublished,
  storefrontUrl,
  onSaved,
}: {
  initialSlug: string;
  initialWhatsapp: string | null;
  initialPublished: boolean;
  storefrontUrl: string;
  onSaved: () => void;
}) {
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp ?? "");
  const [published, setPublished] = useState(initialPublished);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setWhatsapp(initialWhatsapp ?? "");
    setPublished(initialPublished);
  }, [initialWhatsapp, initialPublished]);

  const phoneOk = normalizePhoneE164(whatsapp) != null;

  const anonymousAccess = resolveStorefrontAccess({
    slugFound: true,
    published: initialPublished,
    whatsappE164: normalizePhoneE164(initialWhatsapp),
    eligibleProductCount: 0,
    preview: false,
  });
  const copyEnabled = canCopyStorefrontLink(anonymousAccess);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const decision = canPublishStorefront({
      published,
      whatsappRaw: whatsapp,
      currentlyPublished: initialPublished,
    });
    if (!decision.ok) {
      toast.error(decision.error);
      return;
    }

    setPending(true);
    const result = await updateStorefrontPublication({ whatsapp, published });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Catálogo de produtos atualizado.");
    onSaved();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
      <div className="space-y-1">
        <p className="text-crm-sm font-medium">Publicação do catálogo de produtos</p>
        <p className="break-all text-crm-sm text-muted-foreground">{storefrontUrl}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="storefront-whatsapp">WhatsApp do catálogo de produtos</Label>
        <Input
          id="storefront-whatsapp"
          value={whatsapp}
          inputMode="tel"
          autoComplete="tel"
          maxLength={40}
          placeholder="11987654321"
          onChange={(event) => {
            const next = event.target.value;
            setWhatsapp(next);
            if (normalizePhoneE164(next) == null) setPublished(false);
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="storefront-published" className="cursor-pointer">
          Catálogo de produtos publicado
        </Label>
        <button
          id="storefront-published"
          type="button"
          role="switch"
          aria-checked={published}
          disabled={pending || !phoneOk}
          onClick={() => {
            if (!phoneOk) return;
            setPublished((current) => !current);
          }}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
            published ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-1 size-5 rounded-full bg-background shadow transition-transform",
              published ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>
      <div className={formActionsClass}>
        <Button
          type="button"
          variant="outline"
          className={secondaryActionClass}
          disabled={!copyEnabled || pending}
          onClick={() => void copyLink()}
        >
          Copiar link
        </Button>
        <Button type="button" variant="outline" className={secondaryActionClass} asChild>
          <Link href={storefrontPath(initialSlug)}>Ver prévia</Link>
        </Button>
        <Button type="submit" className={primaryActionClass} disabled={pending}>
          {pending ? "Salvando…" : "Salvar catálogo"}
        </Button>
      </div>
    </form>
  );
}

const STOREFRONT_THEME_FIELDS: { key: StorefrontThemeKey; label: string }[] = [
  { key: "pageBackground", label: "Fundo da página" },
  { key: "pageText", label: "Texto da página" },
  { key: "headerBackground", label: "Fundo do cabeçalho" },
  { key: "headerText", label: "Texto do cabeçalho" },
  { key: "cardBackground", label: "Fundo do card" },
  { key: "cardText", label: "Texto do card" },
  { key: "productTitle", label: "Título do produto" },
  { key: "mutedText", label: "Texto secundário" },
  { key: "border", label: "Bordas" },
  { key: "accent", label: "Botão" },
  { key: "accentText", label: "Texto do botão" },
];

function StorefrontThemePreview({ academyName, theme }: { academyName: string; theme: StorefrontTheme }) {
  const valid = Object.fromEntries(
    Object.entries(theme).filter(([, value]) => /^#[0-9a-fA-F]{6}$/.test(value)),
  );
  const style = storefrontThemeStyle({ ...storefrontThemeDefaults(), ...valid });
  return (
    <div className="lg:sticky lg:top-4 lg:self-start">
      <p className="mb-2 text-crm-sm text-muted-foreground">Prévia ao vivo</p>
      <div
        style={style}
        className="overflow-hidden rounded-lg border border-border bg-[var(--store-page)] text-[var(--store-text)]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--store-border)] bg-[var(--store-header)] px-2 py-2 text-[var(--store-header-text)]">
          <p className="truncate text-xs font-semibold">{academyName}</p>
          <span className="rounded bg-[var(--store-accent)] px-2 py-1 text-[10px] font-medium text-[var(--store-accent-text)]">
            WhatsApp
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1">
          {[
            { name: "Kimono Training", price: "R$ 189,90" },
            { name: "Faixa branca", price: "R$ 49,90" },
          ].map((item) => (
            <div
              key={item.name}
              className="overflow-hidden rounded-md border border-[var(--store-border)] bg-[var(--store-card)] text-[var(--store-card-text)]"
            >
              <div className="grid aspect-[3/2] place-items-center bg-[var(--store-muted)]/20 text-[11px] text-[var(--store-muted)]">
                Foto
              </div>
              <div className="space-y-1.5 p-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-[var(--store-title)]">{item.name}</p>
                  <p className="text-xs font-semibold">{item.price}</p>
                </div>
                <p className="text-[11px] text-[var(--store-muted)]">Unissex</p>
                <div className="flex gap-1">
                  <span className="rounded border border-[var(--store-accent)] bg-[var(--store-accent)] px-1.5 text-[11px] text-[var(--store-accent-text)]">
                    A1
                  </span>
                  <span className="rounded border border-[var(--store-border)] px-1.5 text-[11px]">A2</span>
                </div>
                <div className="rounded bg-[var(--store-accent)] py-1.5 text-center text-[11px] font-medium text-[var(--store-accent-text)]">
                  Chamar no WhatsApp
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-black px-2 py-1.5 text-[10px] text-white">
          <span>Casca</span>
          <span>Termos · Privacidade</span>
        </div>
      </div>
    </div>
  );
}

function StorefrontThemeForm({
  academyName,
  initialTheme,
  onSaved,
}: {
  academyName: string;
  initialTheme: unknown;
  onSaved: () => void;
}) {
  const parsed = parseStorefrontTheme(initialTheme);
  const [theme, setTheme] = useState<StorefrontTheme>(
    parsed.ok ? parsed.theme : storefrontThemeDefaults(),
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const next = parseStorefrontTheme(initialTheme);
    if (next.ok) setTheme(next.theme);
  }, [initialTheme]);

  function setColor(key: StorefrontThemeKey, value: string) {
    setTheme((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const decision = parseStorefrontTheme(theme);
    if (!decision.ok) {
      toast.error(decision.error);
      return;
    }
    setPending(true);
    const result = await updateStorefrontTheme(decision.theme);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Cores do catálogo de produtos atualizadas.");
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
      <div className="space-y-1">
        <p className="text-crm-sm font-medium">Cores do catálogo de produtos</p>
        <p className="text-crm-sm text-muted-foreground">
          Cabeçalho, fundo, cards e botão. O rodapé permanece preto. O padrão é {STOREFRONT_THEME_DEFAULTS.pageBackground}.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid content-start gap-3">
          {STOREFRONT_THEME_FIELDS.map((field) => (
            <div key={field.key} className="flex items-center gap-3">
              <Label htmlFor={`store-theme-${field.key}`} className="w-40 shrink-0">
                {field.label}
              </Label>
              <input
                id={`store-theme-${field.key}`}
                type="color"
                value={theme[field.key]}
                aria-label={field.label}
                onChange={(event) => setColor(field.key, event.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent"
              />
              <Input
                value={theme[field.key]}
                spellCheck={false}
                maxLength={7}
                onChange={(event) => setColor(field.key, event.target.value)}
                className="font-mono uppercase"
              />
            </div>
          ))}
        </div>
        <StorefrontThemePreview academyName={academyName} theme={theme} />
      </div>
      <div className={formActionsClass}>
        <Button
          type="button"
          variant="outline"
          className={secondaryActionClass}
          disabled={pending}
          onClick={() => setTheme(storefrontThemeDefaults())}
        >
          Restaurar padrão
        </Button>
        <Button type="submit" className={primaryActionClass} disabled={pending}>
          {pending ? "Salvando…" : "Salvar cores"}
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
      const { toastError } = applyActionFailureToForm(form.setError, r);
      if (toastError) toast.error(r.error);
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
          className={`${formShellClass} grid gap-4 md:grid-cols-2`}
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
        <label className={`${formCheckboxRowClass} sm:justify-end`}>
          <Checkbox
            size="sm"
            checked={active}
            disabled={pendingToggle}
            onCheckedChange={(v) => onActiveChecked(v === true)}
            className="touch-manipulation"
          />
          <span className="text-crm-sm font-medium leading-snug">
            Plano ativo (aceita novos vínculos)
          </span>
        </label>
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
