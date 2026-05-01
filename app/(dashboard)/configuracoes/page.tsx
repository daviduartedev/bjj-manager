import type { Metadata } from "next";
import Link from "next/link";
import { Settings } from "lucide-react";

import { ConfiguracoesClient } from "@/components/settings/configuracoes-client";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { loadSettingsPageData } from "@/lib/data/settings-page";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Configurações",
};

export default async function ConfiguracoesPage() {
  const data = await loadSettingsPageData();

  if (!data.ctx) {
    return (
      <div className="mx-auto max-w-6xl space-y-6" data-tour="page-configuracoes">
        <DashboardPageHero
          badge="Preferências"
          title="Configurações"
          description="Complete o vínculo da conta para gerir academia e planos."
        />
        <DashboardPanel icon={Settings} title="Conta incompleta" subtitle="Provisionamento pendente">
          <p className="type-lead" role="status">
            Quando o perfil estiver disponível, poderá editar o nome da academia e os planos.
          </p>
        </DashboardPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-tour="page-configuracoes">
      <DashboardPageHero badge="Preferências" title="Configurações">
        <p className="type-lead max-w-xl">
          Academia e planos (Kid 1, Juvenil, Adulto). Contato e nome de exibição em{" "}
          <Link
            href={ROUTES.perfil}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Perfil
          </Link>
          .
        </p>
      </DashboardPageHero>

      <ConfiguracoesClient
        initialAccountName={data.ctx.account.name}
        plans={data.plans}
      />
    </div>
  );
}
