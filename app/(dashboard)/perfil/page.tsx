import type { Metadata } from "next";
import { UserRound } from "lucide-react";

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
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHero
        badge="Conta"
        title="Perfil"
        description="Dados do utilizador autenticado e da academia associada (AUTH-6.1)."
      />

      {ctx ? (
        <DashboardPanel icon={UserRound} title="Os seus dados" subtitle="Nome, e-mail e academia">
          <dl className="grid gap-6 sm:grid-cols-1 md:max-w-lg">
            <div>
              <dt className="text-crm-xs font-medium text-muted-foreground">Nome</dt>
              <dd className="mt-1 text-crm-sm font-semibold text-foreground">{ctx.profile.display_name}</dd>
            </div>
            <div>
              <dt className="text-crm-xs font-medium text-muted-foreground">E-mail</dt>
              <dd className="mt-1 text-crm-sm font-semibold text-foreground">{user?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-crm-xs font-medium text-muted-foreground">Academia</dt>
              <dd className="mt-1 text-crm-sm font-semibold text-foreground">{ctx.account.name}</dd>
            </div>
          </dl>
        </DashboardPanel>
      ) : (
        <DashboardPanel icon={UserRound} title="Perfil incompleto" subtitle="Aguardando provisionamento">
          <p className="type-lead" role="status">
            Perfil completo disponível após o vínculo com academia e perfil na base de dados (AUTH-6.1).
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
