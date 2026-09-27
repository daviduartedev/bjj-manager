"use client";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { DashboardStatTile } from "@/components/layout/dashboard-stat-tile";
import type { MonthFinanceSummary } from "@/lib/data/mensalidades-month-summary";
import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";
import { PieChart, Receipt, Users, Wallet } from "lucide-react";

type Props = {
  summary: MonthFinanceSummary;
  monthCaption: string;
};

export function MensalidadesMonthFinancePanel(props: Props) {
  const { summary } = props;
  const maxPlan =
    summary.paidByPlanLabel.length === 0
      ? 1
      : Math.max(...summary.paidByPlanLabel.map((x) => x.totalCents), 1);

  return (
    <DashboardPanel
      icon={PieChart}
      title="Resumo financeiro do mês"
      contentClassName="p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
        <DashboardStatTile
          label="Recebido"
          value={formatMoneyBrFromCents(summary.totalPaidReceivedCents)}
          icon={Wallet}
          accent="paid"
        />
        <DashboardStatTile label="Bolsistas" value={summary.scholarshipCount} icon={Users} accent="info" />
        <DashboardStatTile label="Outro status" value={summary.otherCount} icon={Receipt} accent="pending" />
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
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
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
