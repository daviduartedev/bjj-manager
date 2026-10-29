"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { changeAcademyCommercialKind, createInternalTestAcademy } from "@/app/admin/casca/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACADEMY_MODALITIES, MODALITY_LABELS } from "@/lib/modalities/catalog";
import type { AdminAcademy, AdminOverview } from "@/lib/platform-admin/service";
import { SUBSCRIPTION_PLANS, getSubscriptionPlan } from "@/lib/subscriptions/catalog";

const selectClass = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const KINDS = { commercial: "Comercial", internal_test: "Teste interno", exempt: "Isenta" } as const;
const STATUSES = { pending: "Adesão pendente", trialing: "Avaliação de 3 dias", active: "Ativa", past_due: "Pagamento pendente", cancelled: "Cancelada" } as const;
const brl = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const date = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));

function AcademyCard({ academy }: { academy: AdminAcademy }) {
  const router = useRouter();
  const [kind, setKind] = useState<string>(academy.kind);
  const [plan, setPlan] = useState<string>(academy.plan_id);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!window.confirm(kind === "commercial" ? "Retirar a condição especial? A academia precisará concluir uma nova adesão, sem novo teste grátis." : "Aplicar esta condição? A cobrança recorrente existente será encerrada antes da alteração.")) return;
    const form = new FormData(event.currentTarget);
    setPending(true); setError(null);
    try {
      const result = await changeAcademyCommercialKind({ accountId: academy.account_id, kind, planId: plan, reason: form.get("reason") });
      if (!result.ok) { setError(result.error); return; }
      toast.success("Condição comercial atualizada."); router.refresh();
    } catch { setError("Não foi possível salvar. Tente novamente."); }
    finally { setPending(false); }
  }

  const unchanged = kind === academy.kind && plan === academy.plan_id;
  const commercialPlanOnly = academy.kind === "commercial" && kind === "commercial";
  return <article className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-lg font-semibold">{academy.academy_name}</h3><p className="mt-1 text-sm text-muted-foreground">{getSubscriptionPlan(academy.plan_id)?.name} · {academy.active_students} / {getSubscriptionPlan(academy.plan_id)?.activeStudentLimit} alunos ativos</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{KINDS[academy.kind]}</span></div>
    <p className="mt-4 text-sm">{academy.kind === "commercial" ? STATUSES[academy.status] : "Sem cobrança recorrente"}</p>
    {academy.kind === "commercial" && academy.status === "trialing" && academy.trial_ends_at && <p className="mt-1 text-sm text-muted-foreground">Teste até {date(academy.trial_ends_at)}</p>}
    {academy.kind === "commercial" && academy.paid_until && <p className="mt-1 text-sm text-muted-foreground">Período pago até {date(academy.paid_until)}</p>}
    <details className="mt-5 border-t border-border pt-3"><summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-primary">Gerenciar condição comercial</summary>
      <form className="mt-3 space-y-4" onSubmit={submit}>
        <fieldset disabled={pending} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor={`kind-${academy.account_id}`}>Condição</Label><select id={`kind-${academy.account_id}`} className={selectClass} value={kind} onChange={event => setKind(event.target.value)}>{Object.entries(KINDS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor={`plan-${academy.account_id}`}>Capacidade</Label><select id={`plan-${academy.account_id}`} className={selectClass} value={plan} onChange={event => setPlan(event.target.value)}>{SUBSCRIPTION_PLANS.map(item => <option key={item.id} value={item.id}>{item.name} · {item.activeStudentLimit} ativos</option>)}</select></div></div>
          <div className="space-y-2"><Label htmlFor={`reason-${academy.account_id}`}>Motivo da alteração</Label><textarea id={`reason-${academy.account_id}`} name="reason" required minLength={5} maxLength={500} rows={3} className={`${selectClass} h-auto py-3`} /></div>
          {commercialPlanOnly && !unchanged && <p className="text-sm text-muted-foreground">Trocas de plano comercial são feitas na assinatura da própria academia, com a cobrança correspondente.</p>}
          {kind === "commercial" && academy.kind !== "commercial" && <p className="text-sm text-muted-foreground">A academia ficará com adesão pendente, sem nova avaliação gratuita. A cobrança não será retomada automaticamente.</p>}
          <Button type="submit" disabled={pending || unchanged || commercialPlanOnly}>{pending ? "Salvando…" : "Aplicar condição"}</Button>
        </fieldset>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </form>
    </details>
  </article>;
}

function CreateInternalAcademy() {
  const router = useRouter();
  const requestId = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    requestId.current ??= crypto.randomUUID();
    setPending(true); setError(null);
    try {
      const result = await createInternalTestAcademy({ requestId: requestId.current, academyName: data.get("academyName"), email: data.get("email"), password: data.get("password"), modality: data.get("modality"), planId: data.get("planId") });
      if (!result.ok) { setError(result.error); return; }
      formElement.reset(); requestId.current = null;
      toast.success("Academia interna criada. Use as credenciais informadas para acessar."); router.refresh();
    } catch { setError("Criação não concluída. Repita com os mesmos dados para retomar com segurança."); }
    finally { setPending(false); }
  }

  return <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6"><h2 className="text-xl font-semibold">Nova academia interna de teste</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Crie um acesso próprio para demonstração e validação, sem prazo nem cobrança. Use um e-mail novo e guarde as credenciais; nenhuma conta existente será reutilizada.</p>
    <form className="mt-6" onSubmit={submit}><fieldset disabled={pending} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="internal-name">Nome da academia</Label><Input id="internal-name" name="academyName" required minLength={2} maxLength={80} /></div>
      <div className="space-y-2"><Label htmlFor="internal-email">E-mail novo de teste</Label><Input id="internal-email" name="email" type="email" autoComplete="off" required maxLength={254} /></div>
      <div className="space-y-2"><Label htmlFor="internal-password">Senha do acesso de teste</Label><Input id="internal-password" name="password" type="password" autoComplete="new-password" required minLength={15} maxLength={72} /><p className="text-xs text-muted-foreground">Pelo menos 15 caracteres.</p></div>
      <div className="space-y-2"><Label htmlFor="internal-modality">Modalidade</Label><select id="internal-modality" name="modality" className={selectClass} defaultValue="jiu_jitsu">{ACADEMY_MODALITIES.map(modality => <option value={modality} key={modality}>{MODALITY_LABELS[modality]}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="internal-plan">Capacidade</Label><select id="internal-plan" name="planId" className={selectClass} defaultValue="academia">{SUBSCRIPTION_PLANS.map(plan => <option key={plan.id} value={plan.id}>{plan.name} · {plan.activeStudentLimit} ativos</option>)}</select></div>
      <div className="flex items-end"><Button type="submit" disabled={pending}>{pending ? "Criando…" : "Criar academia de teste"}</Button></div>
    </fieldset>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}</form>
  </section>;
}

export function PlatformAdminDashboard({ overview, page }: { overview: AdminOverview & { mrrCents: number }; page: number }) {
  const metrics = [
    { label: "Receita recorrente dos pagantes", value: brl(overview.mrrCents) },
    { label: "Em avaliação de 3 dias", value: overview.counts.trialing },
    { label: "Academias isentas", value: overview.counts.exempt },
    { label: "Testes internos", value: overview.counts.internal_test },
    { label: "Novas pagantes neste mês", value: overview.counts.new_paid },
    { label: "Assinaturas canceladas", value: overview.counts.cancelled },
  ];
  return <>
    <section aria-label="Indicadores comerciais" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{metrics.map(metric => <div key={metric.label} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-3 text-2xl font-semibold tracking-tight">{metric.value}</p></div>)}</section>
    <p className="mt-3 text-xs leading-5 text-muted-foreground">Receita recorrente considera assinaturas comerciais ativas com período pago vigente. Avaliações, testes internos e isenções não entram no valor.</p>
    <section className="mt-10"><h2 className="text-xl font-semibold">Academias <span className="text-muted-foreground">({overview.total})</span></h2>{overview.academies.length === 0 ? <p role="status" className="mt-5 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Nenhuma academia nesta página.</p> : <div className="mt-5 grid gap-5 lg:grid-cols-2">{overview.academies.map(academy => <AcademyCard key={`${academy.account_id}-${academy.kind}-${academy.plan_id}`} academy={academy} />)}</div>}
      <nav aria-label="Páginas de academias" className="mt-5 flex flex-wrap items-center gap-4">{page > 1 && <Link className="inline-flex min-h-11 items-center font-medium text-primary underline" href={`/admin/casca?pagina=${page - 1}`}>Página anterior</Link>}<span className="text-sm text-muted-foreground">Página {page}</span>{page * 50 < overview.total && <Link className="inline-flex min-h-11 items-center font-medium text-primary underline" href={`/admin/casca?pagina=${page + 1}`}>Próxima página</Link>}</nav>
    </section>
    <CreateInternalAcademy />
    <section className="mt-10"><h2 className="text-xl font-semibold">Histórico comercial recente</h2>{overview.history.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Nenhuma alteração registrada.</p> : <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card px-5">{overview.history.map(item => <li key={item.id} className="py-4"><p className="text-sm font-medium">{item.academy_name} · {item.action === "create_internal" ? "Teste interno criado" : KINDS[item.action as keyof typeof KINDS] ?? "Condição alterada"}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.reason}</p><p className="mt-2 text-xs text-muted-foreground">{date(item.created_at)}</p></li>)}</ul>}</section>
  </>;
}
