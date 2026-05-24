import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { EmptyState } from "@/components/layout/empty-state";

export const metadata: Metadata = {
  title: "Loja",
};

export default function PortalLojaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHero badge="Loja" title="Loja da academia" description="Produtos e reservas." />
      <EmptyState
        icon={ShoppingBag}
        title="Em breve"
        description="A vitrine e reservas estarão disponíveis na Fase 3 do portal."
      />
    </div>
  );
}
