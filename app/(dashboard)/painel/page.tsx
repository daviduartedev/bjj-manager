import type { Metadata } from "next";

import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { PainelDashboard } from "@/components/painel/painel-dashboard";
import { PageFrame } from "@/components/prototype/page-frame";
import { Hand } from "lucide-react";

import { loadPainelPageData } from "@/lib/data/painel-page";
import { getCurrentAccount } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Painel",
};

export default async function PainelPage() {
  const ctx = await getCurrentAccount();

  if (!ctx) {
    return (
      <PageFrame
        title="Painel"
        emoji="📊"
        icon={Hand}
        tone="amber"
      >
        <DashboardPanel
          icon={Hand}
          title="Provisionamento pendente"
          subtitle="Vínculo com a base de dados"
        >
          <p className="font-medium text-foreground">Conta não configurada</p>
          <p className="type-lead mt-2">
            O utilizador existe na autenticação, mas falta vínculo com academia e perfil. Peça ao administrador o
            passo em{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-crm-xs">docs/security/rls.md</code>.
          </p>
        </DashboardPanel>
      </PageFrame>
    );
  }

  const data = await loadPainelPageData(ctx.account.name);

  return (
    <PainelDashboard
      displayName={ctx.profile.display_name}
      accountName={ctx.account.name}
      activeStudentCount={data.activeStudentCount}
      overdueCount={data.overdueCount}
      graduationAlertCount={data.graduationAlertCount}
      birthdayToday={data.birthdayToday}
      dueToday={data.dueToday}
      overdue14={data.overdue14}
      graduationAlerts={data.graduationAlerts}
      distributionAdult={data.distributionAdult}
      distributionKids={data.distributionKids}
      todayYmd={data.todayYmd}
      referenceMonth={data.referenceMonth}
      monthFinance={data.monthFinance}
      billingMix={data.billingMix}
      todaySessions={data.todaySessions}
      nextSession={data.nextSession}
    />
  );
}
