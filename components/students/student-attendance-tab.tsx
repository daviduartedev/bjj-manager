import { AttendanceHistoryPanel } from "@/components/attendance/attendance-history-panel";
import type { StudentAttendancesPage } from "@/lib/data/student-attendances";
import { routeAlunoPerfil } from "@/lib/routes";

type Props = {
  studentId: string;
  data: StudentAttendancesPage;
  error?: string | null;
};

export function StudentAttendanceTab({ studentId, data, error }: Props) {
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
      paginationBasePath={routeAlunoPerfil(studentId)}
      paginationQuery={{ tab: "presenca" }}
      emptyTitle="Ainda não há presenças registadas"
      emptyDescription="Quando o professor confirmar presença oficial nas aulas, o histórico aparecerá aqui."
    />
  );
}
