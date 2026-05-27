"use client";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import type { MonthFinanceSummary } from "@/lib/data/mensalidades-month-summary";
import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";
import { cn } from "@/lib/utils";
import { PieChart } from "lucide-react";

type Props = {
  summary: MonthFinanceSummary;
  monthCaption: string;
};

export function MensalidadesMonthFinancePanel(props: Props) {
  const { summary, monthCaption } = props;
  const maxPlan =
    summary.paidByPlanLabel.length === 0
      ? 1
      : Math.max(...summary.paidByPlanLabel.map((x) => x.totalCents), 1);

  return (
    <DashboardPanel
      icon={PieChart}
      title="Resumo financeiro do mês"
      subtitle={`Pagamentos «Pago» registrados, ${monthCaption}`}
      contentClassName="p-4 sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[hsl(var(--status-paid)/0.28)] bg-gradient-to-br from-[hsl(var(--status-paid)/0.08)] to-card px-4 py-3">
          <p className="text-crm-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total em pagamentos (Pago)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[hsl(var(--status-paid-foreground))]">
            {formatMoneyBrFromCents(summary.totalPaidReceivedCents)}
          </p>
          <p className="mt-1 text-crm-xs text-muted-foreground">
            {summary.paidCount} lançamento{summary.paidCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-lg border border-border/80 bg-card px-4 py-3">
          <p className="text-crm-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bolsistas (isenção)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {summary.scholarshipCount}
          </p>
          <p className="mt-1 text-crm-xs text-muted-foreground">aluno(s) no mês</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-card px-4 py-3">
          <p className="text-crm-xs font-medium uppercase tracking-wide text-muted-foreground">
            Outro status
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {summary.otherCount}
          </p>
          <p className="mt-1 text-crm-xs text-muted-foreground">lançamento(s)</p>
        </div>
        <div className="rounded-lg border border-border border-dashed bg-muted/20 px-4 py-3 sm:col-span-2 lg:col-span-1">
          <p className="text-crm-xs leading-snug text-muted-foreground">
            Montantes conforme plano vigente ao registrar{" "}
            <strong className="font-medium text-foreground">Pago</strong>. O resumo usa o mês selecionado na lista.
          </p>
        </div>
      </div>

      {summary.paidByPlanLabel.length > 0 ? (
        <div className="mt-6 border-t border-border/70 pt-5">
          <p className="mb-3 text-crm-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Por plano (soma dos pagamentos «Pago»)
          </p>
          <ul className="space-y-3">
            {summary.paidByPlanLabel.map((row) => (
              <li key={row.planLabel} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-crm-sm">
                  <span className="min-w-0 truncate font-medium text-foreground">{row.planLabel}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatMoneyBrFromCents(row.totalCents)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-primary/75 transition-[width]",
                    )}
                    style={{
                      width: `${Math.round((row.totalCents / maxPlan) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : summary.paidCount === 0 ? (
        <p className="mt-4 text-crm-sm text-muted-foreground" role="status">
          Nenhum pagamento «Pago» neste mês; o total aparece ao registrar.
        </p>
      ) : null}
    </DashboardPanel>
  );
}
