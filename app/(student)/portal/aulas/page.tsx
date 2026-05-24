import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { EmptyState } from "@/components/layout/empty-state";
import { ClassSessionList } from "@/components/student/class-session-list";
import { getStudentPortalAccessState } from "@/lib/auth/student-context";
import { listStudentClassSessions } from "@/lib/data/student-class-sessions";
import { isStudentPortalClassesCheckinEnabled } from "@/lib/feature-flags/student-portal";

export const metadata: Metadata = {
  title: "Aulas",
};

export default async function PortalAulasPage() {
  if (!isStudentPortalClassesCheckinEnabled()) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <DashboardPageHero badge="Aulas" title="Minhas aulas" description="Check-in e horários." />
        <EmptyState
          icon={CalendarDays}
          title="Check-in indisponível"
          description="A listagem de aulas e check-in ainda não está activa. Contacte a recepção se precisar de ajuda."
        />
      </div>
    );
  }

  const access = await getStudentPortalAccessState();
  if (access.kind !== "ready") {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <DashboardPageHero badge="Aulas" title="Minhas aulas" description="Check-in e horários." />
        <EmptyState
          icon={CalendarDays}
          title="Complete o acesso ao portal"
          description="Conclua o onboarding para ver suas aulas."
        />
      </div>
    );
  }

  const result = await listStudentClassSessions();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <DashboardPageHero
        badge="Aulas"
        title="Minhas aulas"
        description="Próximos 7 dias — confirme presença quando a janela abrir."
      />
      <ClassSessionList
        sessions={result.ok ? result.sessions : []}
        error={result.ok ? null : result.error}
      />
    </div>
  );
}
