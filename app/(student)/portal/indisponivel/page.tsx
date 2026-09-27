import type { Metadata } from "next";
import { Ban } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageFrame } from "@/components/prototype/page-frame";

export const metadata: Metadata = {
  title: "Portal indisponível",
};

export default function PortalIndisponivelPage() {
  return (
    <PageFrame
      title="Indisponível no momento"
      context="Esta área ainda não está activa para a sua academia."
    >
      <EmptyState
        icon={Ban}
        title="Área ainda não activa"
        description="Esta área ainda não está activa para a sua academia. Contacte a recepção se precisar de ajuda."
      />
    </PageFrame>
  );
}
