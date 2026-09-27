import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageFrame } from "@/components/prototype/page-frame";
import { ClassSessionList } from "@/components/student/class-session-list";
import { getStudentPortalAccessState } from "@/lib/auth/student-context";
import { listStudentClassSessions } from "@/lib/data/student-class-sessions";
import { isStudentPortalClassesCheckinEnabled } from "@/lib/feature-flags/student-portal";

export const metadata: Metadata = {
  title: "Aulas",
};

function AulasFrame({ children }: { children: ReactNode }) {
  return (
    <PageFrame title="Suas próximas aulas" icon={CalendarDays} tone="sky">
      {children}
    </PageFrame>
  );
}

export default async function PortalAulasPage() {
  if (!isStudentPortalClassesCheckinEnabled()) {
    return (
      <AulasFrame>
        <EmptyState
          icon={CalendarDays}
          title="Check-in indisponível"
          description="A listagem de aulas e check-in ainda não está activa. Contacte a recepção se precisar de ajuda."
        />
      </AulasFrame>
    );
  }

  const access = await getStudentPortalAccessState();
  if (access.kind !== "ready") {
    return (
      <AulasFrame>
        <EmptyState
          icon={CalendarDays}
          title="Complete o acesso ao portal"
          description="Conclua o onboarding para ver suas aulas."
        />
      </AulasFrame>
    );
  }

  const result = await listStudentClassSessions();

  return (
    <AulasFrame>
      <ClassSessionList
        sessions={result.ok ? result.sessions : []}
        error={result.ok ? null : result.error}
      />
    </AulasFrame>
  );
}
