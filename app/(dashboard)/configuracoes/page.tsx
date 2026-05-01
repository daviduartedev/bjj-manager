import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";

export const metadata: Metadata = {
  title: "Configurações",
};

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHero
        badge="Preferências"
        title="Configurações"
        description="Dados da academia e preferências serão tratados no ciclo de configurações (SPEC-5.1)."
      />

      <DashboardPanel
        icon={Settings}
        title="Em construção"
        subtitle="Este módulo será preenchido nos próximos ciclos"
      >
        <p className="type-lead">
          Aqui passará a existir a gestão de identidade da academia, planos de mensalidade e outras opções de conta,
          alinhadas ao produto.
        </p>
      </DashboardPanel>
    </div>
  );
}
