import type { Metadata } from "next";

import { PageFrame } from "@/components/prototype/page-frame";
import { getStudentForCurrentUser } from "@/lib/auth/student-context";

export const metadata: Metadata = {
  title: "Portal do aluno",
};

export default async function PortalHomePage() {
  const student = await getStudentForCurrentUser();
  const firstName = student?.full_name?.split(/\s+/)[0] ?? "Aluno";

  return (
    <PageFrame
      title={`Olá, ${firstName}`}
      context="Acompanhe aulas, loja e pagamentos da sua academia."
    >
      {null}
    </PageFrame>
  );
}
