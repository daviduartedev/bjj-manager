import { AttendanceHistoryPanel } from "@/components/attendance/attendance-history-panel";
import type { StudentAttendancesPage } from "@/lib/data/student-attendances";
import { ROUTES } from "@/lib/routes";

type Props = {
  data: StudentAttendancesPage;
  error?: string | null;
};

export function StudentAttendanceList({ data, error }: Props) {
  if (error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <AttendanceHistoryPanel
      data={data}
      paginationBasePath={ROUTES.portalPresenca}
      emptyTitle="Ainda não há aulas frequentadas registadas"
      emptyDescription="Quando o professor confirmar a sua presença nas aulas, elas aparecerão aqui."
    />
  );
}
