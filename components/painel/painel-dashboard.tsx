import Link from "next/link";
import {
  AlertTriangle,
  Cake,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PaymentReminderList } from "@/components/painel/payment-reminder-list";
import type {
  PainelAttentionRow,
  PainelDistributionSlice,
} from "@/lib/data/painel-page";
import type { PaymentReminderRow } from "@/lib/painel/payment-reminders";
import {
  ROUTES,
  routeAlunoPerfil,
  routeAlunosActivos,
  routeMensalidadesComFiltro,
} from "@/lib/routes";
import { beltDistributionBarColor } from "@/lib/students/belt-chart-colors";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
  accountName: string;
  activeStudentCount: number;
  overdueCount: number;
  birthdayMonthCount: number;
  graduationAlertCount: number;
  birthdayToday: PainelAttentionRow[];
  dueToday: PainelAttentionRow[];
  overdue14: PainelAttentionRow[];
  paymentReminders: PaymentReminderRow[];
  graduationAlerts: PainelAttentionRow[];
  distributionAdult: PainelDistributionSlice[];
  distributionKids: PainelDistributionSlice[];
};

function KpiLinkCard(props: {
  href: string;
  label: string;
  value: number;
  icon: typeof Users;
  variant?: "default" | "pending" | "overdue";
}) {
  const { href, label, value, icon: Icon, variant = "default" } = props;
  const tone =
    variant === "pending"
      ? "dashboard-kpi-card dashboard-kpi-card--pending"
      : variant === "overdue"
        ? "dashboard-kpi-card dashboard-kpi-card--overdue"
        : "dashboard-kpi-card dashboard-kpi-card--default";

  return (
    <Link href={href} className={cn(tone)}>
      <div className="flex items-start justify-between gap-2">
        <span className="type-meta-label">{label}</span>
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </span>
    </Link>
  );
}

function AttentionList(props: { empty: string; rows: PainelAttentionRow[] }) {
  if (props.rows.length === 0) {
    return (
      <p className="text-crm-sm text-muted-foreground">{props.empty}</p>
    );
  }
  return (
    <ul className="space-y-2">
      {props.rows.map((r) => (
        <li key={r.studentId}>
          <Link
            href={routeAlunoPerfil(r.studentId)}
            className="text-crm-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {r.fullName}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DistributionBlock(props: {
  title: string;
  slices: PainelDistributionSlice[];
  empty: string;
}) {
  const max = Math.max(1, ...props.slices.map((s) => s.count));
  if (props.slices.length === 0) {
    return <p className="text-crm-sm text-muted-foreground">{props.empty}</p>;
  }
  return (
    <div className="space-y-3">
      <p className="type-meta-label">{props.title}</p>
      <ul className="space-y-2.5">
        {props.slices.map((s) => (
          <li key={s.beltId} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-crm-sm">
              <span className="font-medium text-foreground">{s.label}</span>
              <span className="tabular-nums text-muted-foreground">{s.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${Math.round((s.count / max) * 100)}%`,
                  backgroundColor: beltDistributionBarColor(s.slug, s.kind),
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PainelDashboard(props: Props) {
  const {
    displayName,
    accountName,
    activeStudentCount,
    overdueCount,
    birthdayMonthCount,
    graduationAlertCount,
    birthdayToday,
    dueToday,
    overdue14,
    paymentReminders,
    graduationAlerts,
    distributionAdult,
    distributionKids,
  } = props;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-7" data-tour="page-painel">
        <DashboardPageHero
          badge="Visão geral"
          title={`Olá, ${displayName}`}
          description={`${accountName}, resumo do dia e atalhos.`}
          aside={
            <div className="flex max-w-xs items-center gap-3 rounded-lg border border-primary/25 bg-gradient-to-br from-primary/[0.07] to-card px-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/[0.08] text-primary">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <div>
                <p className="type-meta-label">Hoje</p>
                <p className="type-card-heading mt-0.5 text-crm-sm">Indicadores rápidos</p>
              </div>
            </div>
          }
        />

        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Indicadores principais
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiLinkCard
              href={routeAlunosActivos()}
              label="Alunos ativos"
              value={activeStudentCount}
              icon={Users}
            />
            <KpiLinkCard
              href={routeMensalidadesComFiltro("atrasado")}
              label="Mensalidades atrasadas"
              value={overdueCount}
              icon={Wallet}
              variant="overdue"
            />
            <KpiLinkCard
              href={routeAlunosActivos()}
              label="Aniversariantes do mês"
              value={birthdayMonthCount}
              icon={Cake}
              variant="pending"
            />
            <KpiLinkCard
              href={routeAlunosActivos()}
              label="Alertas de graduação"
              value={graduationAlertCount}
              icon={TrendingUp}
            />
          </div>
        </section>
      </div>

      <section data-testid="payment-reminders" aria-labelledby="payment-reminders-heading">
        <h2 id="payment-reminders-heading" className="sr-only">
          Lembrete de pagamento
        </h2>
        <DashboardPanel
          icon={MessageCircle}
          title="Lembrete de pagamento"
          subtitle="Um clique por aluno, WhatsApp com mensagem pronta"
        >
          <PaymentReminderList rows={paymentReminders} />
        </DashboardPanel>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel
          icon={AlertTriangle}
          title="Atenção hoje"
          subtitle="Prioridades (fuso São Paulo)"
        >
          <div className="space-y-6">
            <div>
              <p className="type-meta-label mb-2">Aniversariantes do dia</p>
              <AttentionList empty="Nenhum aniversariante hoje." rows={birthdayToday} />
            </div>
            <div>
              <p className="type-meta-label mb-2">Vencimentos hoje</p>
              <AttentionList empty="Nenhum vencimento para hoje." rows={dueToday} />
            </div>
            <div>
              <p className="type-meta-label mb-2">Atraso há mais de 14 dias</p>
              <AttentionList
                empty="Nenhum aluno com atraso prolongado."
                rows={overdue14}
              />
            </div>
            <div>
              <p className="type-meta-label mb-2">Tempo elevado na faixa ou no grau</p>
              <AttentionList
                empty="Nenhum alerta de graduação por tempo."
                rows={graduationAlerts}
              />
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel
          icon={LayoutDashboard}
          title="Distribuição por faixa"
          subtitle="Alunos ativos, por faixa"
        >
          <div className="space-y-8">
            <DistributionBlock
              title="Adulto"
              slices={distributionAdult}
              empty="Sem alunos adultos ativos com faixa registrada."
            />
            <DistributionBlock
              title="Kids"
              slices={distributionKids}
              empty="Sem alunos kids ativos com faixa registrada."
            />
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        icon={CalendarClock}
        title="Ações rápidas"
        subtitle="Atalhos frequentes"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={ROUTES.alunosNovo}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 font-medium transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <UserPlus className="size-4" aria-hidden />
            Cadastrar aluno
          </Link>
          <Link
            href={routeMensalidadesComFiltro("pendente")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-4 font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <CreditCard className="size-4" aria-hidden />
            Registrar pagamento
          </Link>
        </div>
      </DashboardPanel>
    </div>
  );
}
