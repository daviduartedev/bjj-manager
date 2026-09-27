import type { Metadata } from "next";

import { PageFrame } from "@/components/prototype/page-frame";
import { PixPlaceholder } from "@/components/student/pix-placeholder";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function PortalFinanceiroPage() {
  return (
    <PageFrame title="Pagamentos" context="Mensalidades e pagamento via PIX.">
      <PixPlaceholder />
    </PageFrame>
  );
}
