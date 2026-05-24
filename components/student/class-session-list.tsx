import { CalendarDays } from "lucide-react";

import { ClassSessionCard } from "@/components/student/class-session-card";
import { EmptyState } from "@/components/layout/empty-state";
import type { StudentClassSessionRow } from "@/lib/data/student-class-sessions";

type ClassSessionListProps = {
  sessions: StudentClassSessionRow[];
  error?: string | null;
};

export function ClassSessionList({ sessions, error }: ClassSessionListProps) {
  if (error) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Não foi possível carregar as aulas"
        description={error}
      />
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhuma aula nos próximos dias"
        description="Quando você estiver inscrito em turmas com aulas agendadas, elas aparecerão aqui."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {sessions.map((session) => (
        <li key={session.id}>
          <ClassSessionCard session={session} />
        </li>
      ))}
    </ul>
  );
}
