import type { Metadata } from "next";
import { LayoutDashboard, Sparkles } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";
import { getCurrentAccount } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Painel",
};

export default async function PainelPage() {
  const ctx = await getCurrentAccount();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHero
        badge="Painel operacional"
        title="Painel"
        description="Visão resumida da academia e alertas simples chegam em ciclos futuros (SPEC-2.7)."
        aside={
          <div className="flex max-w-xs items-center gap-3 rounded-xl border border-border/80 bg-gradient-to-br from-muted/50 to-muted/30 px-4 py-3 shadow-inner ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-crm-xs font-medium text-muted-foreground">Roadmap</p>
              <p className="text-crm-sm font-semibold text-foreground">Resumo e alertas em evolução</p>
            </div>
          </div>
        }
      />

      {ctx ? (
        <DashboardPanel
          icon={LayoutDashboard}
          title="Sua academia"
          subtitle="Dados da sessão e da conta"
        >
          <p className="type-lead">
            Olá, <span className="font-medium text-foreground">{ctx.profile.display_name}</span>.
          </p>
          <p className="mt-4 text-crm-sm">
            <span className="text-muted-foreground">Academia:</span>{" "}
            <span className="font-medium text-foreground">{ctx.account.name}</span>
          </p>
        </DashboardPanel>
      ) : (
        <DashboardPanel
          icon={LayoutDashboard}
          title="Configuração pendente"
          subtitle="Vínculo com a base de dados"
          contentClassName="border-t border-amber-500/25 bg-amber-500/[0.04]"
        >
          <p className="font-medium text-foreground">Conta ainda não configurada</p>
          <p className="type-lead mt-2">
            O utilizador existe no sistema de autenticação, mas falta o vínculo com academia e perfil na base de
            dados. Peça ao administrador para concluir o passo descrito na documentação de segurança (SQL em{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-crm-xs">docs/security/rls.md</code>).
          </p>
        </DashboardPanel>
      )}
    </div>
  );
}
