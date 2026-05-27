import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";

import { DashboardPageHero } from "@/components/layout/dashboard-page-hero";
import { EmptyState } from "@/components/layout/empty-state";
import { StudentAttendanceList } from "@/components/student/student-attendance-list";
import { getStudentPortalAccessState } from "@/lib/auth/student-context";
import { listStudentAttendancesForPortal } from "@/lib/data/student-attendances";
import {
  isStudentPortalClassesCheckinEnabled,
  isStudentPortalEnabled,
} from "@/lib/feature-flags/student-portal";

export const metadata: Metadata = {
  title: "Presença",
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PortalPresencaPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  if (!isStudentPortalEnabled()) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-1 sm:space-y-8 sm:px-0">
        <DashboardPageHero badge="Presença" title="Minhas presenças" />
        <EmptyState
          icon={ClipboardList}
          title="Portal indisponível"
          description="O portal do aluno ainda não está activo."
        />
      </div>
    );
  }

  if (!isStudentPortalClassesCheckinEnabled()) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-1 sm:space-y-8 sm:px-0">
        <DashboardPageHero badge="Presença" title="Minhas presenças" />
        <EmptyState
          icon={ClipboardList}
          title="Histórico indisponível"
          description="O histórico de presença ficará disponível quando as aulas estiverem activas."
        />
      </div>
    );
  }

  const access = await getStudentPortalAccessState();
  if (access.kind !== "ready") {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-1 sm:space-y-8 sm:px-0">
        <DashboardPageHero badge="Presença" title="Minhas presenças" />
        <EmptyState
          icon={ClipboardList}
          title="Complete o acesso ao portal"
          description="Conclua o onboarding para ver o histórico de presença."
        />
      </div>
    );
  }

  const result = await listStudentAttendancesForPortal(page);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 sm:space-y-8 sm:px-0">
      <DashboardPageHero
        badge="Presença"
        title="Minhas presenças"
        description="Aulas em que o professor confirmou a sua presença oficial."
      />
      <StudentAttendanceList
        data={
          result.ok
            ? result.data
            : { rows: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }
        }
        error={result.ok ? null : result.error}
      />
    </div>
  );
}
