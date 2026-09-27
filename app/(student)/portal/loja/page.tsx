import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageFrame } from "@/components/prototype/page-frame";

export const metadata: Metadata = {
  title: "Loja",
};

export default function PortalLojaPage() {
  return (
    <PageFrame title="Loja da academia" context="Produtos e reservas.">
      <EmptyState
        icon={ShoppingBag}
        title="Em breve"
        description="A vitrine e reservas estarão disponíveis na Fase 3 do portal."
      />
    </PageFrame>
  );
}
