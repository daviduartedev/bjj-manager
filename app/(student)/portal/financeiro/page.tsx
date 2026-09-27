import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { PixPlaceholder } from "@/components/student/pix-placeholder";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function PortalFinanceiroPage() {
  return (
    <PageFrame title="Seus pagamentos" icon={Wallet} tone="emerald">
      <PixPlaceholder />
    </PageFrame>
  );
}
