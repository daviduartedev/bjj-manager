import type { Metadata } from "next";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { getStudentForCurrentUser } from "@/lib/auth/student-context";

export const metadata: Metadata = {
  title: "Portal do aluno",
};

export default async function PortalHomePage() {
  const student = await getStudentForCurrentUser();
  const firstName = student?.full_name?.split(/\s+/)[0] ?? "Aluno";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHero
        badge="Portal do aluno"
        title={`Olá, ${firstName}`}
        description="Acompanhe aulas, loja e pagamentos da sua academia."
      />
    </div>
  );
}
