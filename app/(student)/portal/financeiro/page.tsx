import type { Metadata } from "next";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { PixPlaceholder } from "@/components/student/pix-placeholder";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function PortalFinanceiroPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHero
        badge="Financeiro"
        title="Pagamentos"
        description="Mensalidades e pagamento via PIX."
      />
      <PixPlaceholder />
    </div>
  );
}
