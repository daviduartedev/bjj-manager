import type { Metadata } from "next";
import { Ban } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { EmptyState } from "@/components/layout/empty-state";

export const metadata: Metadata = {
  title: "Portal indisponível",
};

export default function PortalIndisponivelPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <DashboardPageHero badge="Portal do aluno" title="Indisponível no momento" />
      <EmptyState
        icon={Ban}
        title="Área ainda não activa"
        description="Esta área ainda não está activa para a sua academia. Contacte a recepção se precisar de ajuda."
      />
    </div>
  );
}
