import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { PerfilClient } from "@/components/settings/perfil-client";
import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { getCurrentAccount, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Perfil",
};

export default async function PerfilPage() {
  const user = await getCurrentUser();
  const ctx = await getCurrentAccount();

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-tour="page-perfil">
      <DashboardPageHero
        badge="Conta"
        title="Perfil"
        description="Nome e contato exibidos na sessão. Academia e planos em Configurações."
      />

      {ctx ? (
        <PerfilClient
          email={user?.email ?? null}
          academyName={ctx.account.name}
          initialDisplayName={ctx.profile.display_name}
          initialPhone={ctx.profile.phone}
        />
      ) : (
        <DashboardPanel icon={UserRound} title="Perfil incompleto" subtitle="Aguardando provisionamento">
          <p className="type-lead" role="status">
            O perfil fica disponível após o vínculo com a academia na base de dados.
            {user?.email ? (
              <>
                {" "}
                Sessão atual: <span className="font-medium text-foreground">{user.email}</span>
              </>
            ) : null}
          </p>
        </DashboardPanel>
      )}
    </div>
  );
}
