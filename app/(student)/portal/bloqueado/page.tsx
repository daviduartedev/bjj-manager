import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageFrame } from "@/components/prototype/page-frame";

export const metadata: Metadata = {
  title: "Acesso bloqueado",
};

export default function PortalBloqueadoPage() {
  return (
    <PageFrame
      title="Acesso bloqueado"
      context="O seu cadastro está arquivado ou removido."
    >
      <EmptyState
        icon={ShieldAlert}
        title="Cadastro inactivo"
        description="O seu cadastro está arquivado ou removido. Contacte a recepção da academia para mais informações."
      />
    </PageFrame>
  );
}
