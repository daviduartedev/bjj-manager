import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageFrame } from "@/components/prototype/page-frame";
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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function variantQuery(raw: string | string[] | undefined): Record<string, string> | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "A" || value === "B" || value === "C") return { variant: value };
  return undefined;
}

function PresencaFrame({ children }: { children: ReactNode }) {
  return (
    <PageFrame title="Seu histórico no tatame" icon={ClipboardList} tone="emerald">
      {children}
    </PageFrame>
  );
}

export default async function PortalPresencaPage({ searchParams }: Props) {
  const raw = await searchParams;
  const pageParam = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const page = Math.max(1, Number(pageParam) || 1);

  if (!isStudentPortalEnabled()) {
    return (
      <PresencaFrame>
        <EmptyState
          icon={ClipboardList}
          title="Portal indisponível"
          description="O portal do aluno ainda não está activo."
        />
      </PresencaFrame>
    );
  }

  if (!isStudentPortalClassesCheckinEnabled()) {
    return (
      <PresencaFrame>
        <EmptyState
          icon={ClipboardList}
          title="Histórico indisponível"
          description="O histórico de presença ficará disponível quando as aulas estiverem activas."
        />
      </PresencaFrame>
    );
  }

  const access = await getStudentPortalAccessState();
  if (access.kind !== "ready") {
    return (
      <PresencaFrame>
        <EmptyState
          icon={ClipboardList}
          title="Complete o acesso ao portal"
          description="Conclua o onboarding para ver o histórico de presença."
        />
      </PresencaFrame>
    );
  }

  const result = await listStudentAttendancesForPortal(page);

  return (
    <PresencaFrame>
      <StudentAttendanceList
        data={
          result.ok
            ? result.data
            : { rows: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }
        }
        error={result.ok ? null : result.error}
        paginationQuery={variantQuery(raw.variant)}
      />
    </PresencaFrame>
  );
}
