import type { Metadata } from "next";
import { Hand } from "lucide-react";

import { PageFrame } from "@/components/prototype/page-frame";
import { StudentProfileSummary } from "@/components/student/student-profile-summary";
import { getOwnStudentPortalProfile } from "@/lib/data/student-portal-profile";

export const metadata: Metadata = {
  title: "Portal do aluno",
};

export default async function PortalHomePage() {
  let profile = null;
  let error = false;
  try { profile = await getOwnStudentPortalProfile(); } catch { error = true; }
  return (
    <PageFrame
      title="Início"
      emoji="🏠"
      icon={Hand}
      tone="amber"
    >
      {error ? <p role="alert" className="text-sm text-destructive">Não foi possível carregar sua ficha. Recarregue a página para tentar novamente.</p> : profile ? <StudentProfileSummary profile={profile} /> : <p role="status" className="text-sm text-muted-foreground">Sua ficha não está disponível. Fale com o professor para verificar o acesso.</p>}
    </PageFrame>
  );
}
