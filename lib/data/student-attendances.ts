import { getCurrentAccount } from "@/lib/auth";
import { getStudentForCurrentUser } from "@/lib/auth/student-context";
import { STUDENT_ATTENDANCE_PAGE_SIZE } from "@/lib/constants/classes";
import { formatDateBR } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type StudentAttendanceRow = {
  id: string;
  sessionDate: string;
  sessionDateLabel: string;
  startTime: string;
  endTime: string;
  className: string;
  instructorName: string;
  origin: "checkin_student" | "manual_instructor";
  recordedByName: string;
  recordedAt: string;
};

export type StudentAttendancesPage = {
  rows: StudentAttendanceRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type StudentAttendancesResult =
  | { ok: true; data: StudentAttendancesPage }
  | { ok: false; error: string };

function relationOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

function formatTimeHm(time: string): string {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

function normalizePage(page: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

const ATTENDANCE_SELECT = `
  id,
  origin,
  recorded_at,
  class_sessions (
    session_date,
    start_time,
    end_time,
    classes (
      name,
      profiles!classes_instructor_profile_id_fkey ( display_name )
    )
  ),
  recorder:profiles!attendances_recorded_by_fkey ( display_name )
`;

function mapAttendanceRow(raw: Record<string, unknown>): StudentAttendanceRow | null {
  const sessionRel = relationOne(
    raw.class_sessions as Record<string, unknown> | Record<string, unknown>[] | null,
  );
  if (!sessionRel) return null;

  const classRel = relationOne(
    sessionRel.classes as Record<string, unknown> | Record<string, unknown>[] | null,
  );
  const instructorRel = relationOne(
    classRel?.profiles as { display_name: string } | { display_name: string }[] | null,
  );
  const recorderRel = relationOne(
    raw.recorder as { display_name: string } | { display_name: string }[] | null,
  );

  const sessionDate = sessionRel.session_date as string;

  return {
    id: raw.id as string,
    sessionDate,
    sessionDateLabel: formatDateBR(sessionDate) ?? sessionDate,
    startTime: formatTimeHm(sessionRel.start_time as string),
    endTime: formatTimeHm(sessionRel.end_time as string),
    className: (classRel?.name as string) ?? "Turma",
    instructorName: instructorRel?.display_name ?? "Professor",
    origin: raw.origin as "checkin_student" | "manual_instructor",
    recordedByName: recorderRel?.display_name ?? "Professor",
    recordedAt: raw.recorded_at as string,
  };
}

async function fetchAttendancesPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  page: number,
): Promise<StudentAttendancesResult> {
  const safePage = normalizePage(page);
  const pageSize = STUDENT_ATTENDANCE_PAGE_SIZE;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("attendances")
    .select(ATTENDANCE_SELECT, { count: "exact" })
    .eq("student_id", studentId)
    .order("session_date", { foreignTable: "class_sessions", ascending: false })
    .order("start_time", { foreignTable: "class_sessions", ascending: false })
    .order("recorded_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { ok: false, error: "Não foi possível carregar o histórico de presença." };
  }

  const rows = (data ?? [])
    .map((row) => mapAttendanceRow(row as Record<string, unknown>))
    .filter((row): row is StudentAttendanceRow => row !== null);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    ok: true,
    data: {
      rows,
      total,
      page: safePage,
      pageSize,
      totalPages,
    },
  };
}

/** Histórico para o professor no perfil do aluno (**SPR-12**). */
export async function listStudentAttendancesForProfessor(
  studentId: string,
  page = 1,
): Promise<StudentAttendancesResult> {
  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "professor") {
    return { ok: false, error: "Sem permissão." };
  }

  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("account_id", ctx.profile.account_id)
    .maybeSingle();

  if (studentError || !student) {
    return { ok: false, error: "Aluno não encontrado." };
  }

  return fetchAttendancesPage(supabase, studentId, page);
}

/** Histórico do aluno autenticado no portal (**SPT-13**). */
export async function listStudentAttendancesForPortal(
  page = 1,
): Promise<StudentAttendancesResult> {
  const student = await getStudentForCurrentUser();
  if (!student) {
    return { ok: false, error: "Sessão de aluno inválida." };
  }
  if (student.archived_at || student.removed_at) {
    return { ok: false, error: "Acesso ao portal bloqueado para este cadastro." };
  }

  const supabase = await createClient();
  return fetchAttendancesPage(supabase, student.id, page);
}
