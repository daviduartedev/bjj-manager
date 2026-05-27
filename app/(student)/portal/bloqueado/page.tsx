import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { EmptyState } from "@/components/layout/empty-state";

export const metadata: Metadata = {
  title: "Acesso bloqueado",
};

export default function PortalBloqueadoPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <DashboardPageHero badge="Portal do aluno" title="Acesso bloqueado" />
      <EmptyState
        icon={ShieldAlert}
        title="Cadastro inactivo"
        description="O seu cadastro está arquivado ou removido. Contacte a recepção da academia para mais informações."
      />
    </div>
  );
}
