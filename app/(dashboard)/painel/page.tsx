import type { Metadata } from "next";

import { PainelDashboard } from "@/components/painel/painel-dashboard";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { LayoutDashboard } from "lucide-react";

import { loadPainelPageData } from "@/lib/data/painel-page";
import { getCurrentAccount } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Painel",
};

export default async function PainelPage() {
  const ctx = await getCurrentAccount();

  if (!ctx) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <DashboardPageHero
          badge="Conta"
          title="Painel"
          description="Associe a conta à academia para ver o resumo operacional."
        />
        <DashboardPanel
          icon={LayoutDashboard}
          title="Provisionamento pendente"
          subtitle="Vínculo com a base de dados"
          contentClassName="border-t border-[hsl(var(--status-pending)/0.25)] bg-[hsl(var(--status-pending)/0.06)]"
        >
          <p className="font-medium text-foreground">Conta não configurada</p>
          <p className="type-lead mt-2">
            O utilizador existe na autenticação, mas falta vínculo com academia e perfil. Peça ao administrador o
            passo em{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-crm-xs">docs/security/rls.md</code>.
          </p>
        </DashboardPanel>
      </div>
    );
  }

  const data = await loadPainelPageData();

  return (
    <PainelDashboard
      displayName={ctx.profile.display_name}
      accountName={ctx.account.name}
      activeStudentCount={data.activeStudentCount}
      overdueCount={data.overdueCount}
      birthdayMonthCount={data.birthdayMonthCount}
      graduationAlertCount={data.graduationAlertCount}
      birthdayToday={data.birthdayToday}
      dueToday={data.dueToday}
      overdue14={data.overdue14}
      graduationAlerts={data.graduationAlerts}
      distributionAdult={data.distributionAdult}
      distributionKids={data.distributionKids}
    />
  );
}
