import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { DashboardPanel } from "@/components/layout/dashboard-panel";

export const metadata: Metadata = {
  title: "Mensalidades",
};

export default function MensalidadesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHero
        badge="Financeiro"
        title="Mensalidades"
        description="Acompanhamento financeiro manual será implementado nos ciclos de cobrança (SPEC-2.6)."
      />

      <DashboardPanel
        icon={Wallet}
        title="Área financeira"
        subtitle="Registo de pagamentos e estado por mês"
      >
        <p className="type-lead">
          Em breve poderá consultar e atualizar o estado das mensalidades por aluno e por mês de referência, com
          estados Pago, Pendente, Não pago e outros definidos nas regras de produto.
        </p>
      </DashboardPanel>
    </div>
  );
}
