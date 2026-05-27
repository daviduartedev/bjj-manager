import { fetchMonthBillingSnapshots } from "@/lib/billing/month-billing-snapshots";
import { normalizeReferenceMonth } from "@/lib/billing/reference-month";
import type { MonthBillingIndicator } from "@/lib/billing/month-billing-indicator";
import { toCalendarDateStringInAppTZ } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type SessionCheckInRow = {
  checkInId: string;
  studentId: string;
  studentName: string;
  checkedInAt: string;
  /** PBS-3 indicador financeiro do mês corrente. */
  billingIndicator: MonthBillingIndicator;
  /** Já convertido em presença oficial. */
  hasAttendance: boolean;
};

export type SessionAttendanceRow = {
  attendanceId: string;
  studentId: string;
  studentName: string;
  origin: "checkin_student" | "manual_instructor";
  recordedAt: string;
  billingIndicator: MonthBillingIndicator;
};

export type SessionManualEligibleRow = {
  studentId: string;
  studentName: string;
  billingIndicator: MonthBillingIndicator;
};

export type SessionPresenceResult =
  | {
      ok: true;
      session: SessionInfo;
      checkIns: SessionCheckInRow[];
      attendances: SessionAttendanceRow[];
      manualEligible: SessionManualEligibleRow[];
    }
  | { ok: false; error: string };

/** @deprecated Use SessionPresenceResult */
export type SessionCheckInsResult = SessionPresenceResult;

export type SessionInfo = {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  className: string;
  classKind: "adult" | "kids";
};

function formatTimeHm(time: string): string {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

function relationOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

async function billingIndicatorsForStudents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentIds: string[],
): Promise<Map<string, MonthBillingIndicator>> {
  if (studentIds.length === 0) return new Map();

  const todayYmd = toCalendarDateStringInAppTZ(new Date());
  const referenceMonthFirstDay =
    normalizeReferenceMonth(`${todayYmd.slice(0, 7)}-01`) ?? `${todayYmd.slice(0, 7)}-01`;

  const billingSnapshots = await fetchMonthBillingSnapshots({
    supabase,
    studentIds,
    referenceMonthFirstDay,
    today: todayYmd,
  });

  return new Map(billingSnapshots.map((s) => [s.studentId, s.indicator]));
}

export async function listSessionPresence(
  sessionId: string,
): Promise<SessionPresenceResult> {
  const supabase = await createClient();

  const { data: sessionData, error: sessionError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      class_id,
      session_date,
      start_time,
      end_time,
      classes ( name, kind )
    `,
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError || !sessionData) {
    return { ok: false, error: "Sessão não encontrada." };
  }

  const classRel = relationOne(
    sessionData.classes as
      | { name: string; kind: "adult" | "kids" }
      | { name: string; kind: "adult" | "kids" }[]
      | null,
  );
  if (!classRel) {
    return { ok: false, error: "Dados da turma indisponíveis." };
  }

  const session: SessionInfo = {
    id: sessionData.id as string,
    sessionDate: sessionData.session_date as string,
    startTime: formatTimeHm(sessionData.start_time as string),
    endTime: formatTimeHm(sessionData.end_time as string),
    className: classRel.name,
    classKind: classRel.kind,
  };

  const classId = sessionData.class_id as string;

  const [checkInsResult, attendancesResult, enrollmentsResult] = await Promise.all([
    supabase
      .from("check_ins")
      .select(
        `
        id,
        student_id,
        created_at,
        students ( full_name )
      `,
      )
      .eq("class_session_id", sessionId)
      .order("created_at", { ascending: true }),
    supabase
      .from("attendances")
      .select(
        `
        id,
        student_id,
        origin,
        recorded_at,
        students ( full_name )
      `,
      )
      .eq("class_session_id", sessionId)
      .order("recorded_at", { ascending: true }),
    supabase
      .from("student_class_enrollments")
      .select(
        `
        student_id,
        students ( full_name )
      `,
      )
      .eq("class_id", classId),
  ]);

  if (checkInsResult.error) {
    return { ok: false, error: "Não foi possível carregar os check-ins." };
  }
  if (attendancesResult.error) {
    return { ok: false, error: "Não foi possível carregar as presenças." };
  }
  if (enrollmentsResult.error) {
    return { ok: false, error: "Não foi possível carregar inscrições." };
  }

  const attendedStudentIds = new Set(
    (attendancesResult.data ?? []).map((a) => a.student_id as string),
  );
  const checkInStudentIds = new Set(
    (checkInsResult.data ?? []).map((c) => c.student_id as string),
  );

  const allStudentIds = new Set<string>([
    ...(checkInsResult.data ?? []).map((c) => c.student_id as string),
    ...(attendancesResult.data ?? []).map((a) => a.student_id as string),
    ...(enrollmentsResult.data ?? []).map((e) => e.student_id as string),
  ]);

  const indicatorByStudentId = await billingIndicatorsForStudents(
    supabase,
    [...allStudentIds],
  );

  const checkIns: SessionCheckInRow[] = (checkInsResult.data ?? []).map((r) => {
    const studentRel = relationOne(
      r.students as { full_name: string } | { full_name: string }[] | null,
    );
    const studentId = r.student_id as string;
    return {
      checkInId: r.id as string,
      studentId,
      studentName: studentRel?.full_name ?? "Aluno",
      checkedInAt: r.created_at as string,
      billingIndicator: indicatorByStudentId.get(studentId) ?? "pending",
      hasAttendance: attendedStudentIds.has(studentId),
    };
  });

  const attendances: SessionAttendanceRow[] = (attendancesResult.data ?? []).map((r) => {
    const studentRel = relationOne(
      r.students as { full_name: string } | { full_name: string }[] | null,
    );
    const studentId = r.student_id as string;
    return {
      attendanceId: r.id as string,
      studentId,
      studentName: studentRel?.full_name ?? "Aluno",
      origin: r.origin as "checkin_student" | "manual_instructor",
      recordedAt: r.recorded_at as string,
      billingIndicator: indicatorByStudentId.get(studentId) ?? "pending",
    };
  });

  const manualEligible: SessionManualEligibleRow[] = (enrollmentsResult.data ?? [])
    .filter((e) => {
      const studentId = e.student_id as string;
      return !checkInStudentIds.has(studentId) && !attendedStudentIds.has(studentId);
    })
    .map((e) => {
      const studentRel = relationOne(
        e.students as { full_name: string } | { full_name: string }[] | null,
      );
      const studentId = e.student_id as string;
      return {
        studentId,
        studentName: studentRel?.full_name ?? "Aluno",
        billingIndicator: indicatorByStudentId.get(studentId) ?? "pending",
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "pt-BR"));

  return { ok: true, session, checkIns, attendances, manualEligible };
}

/** Alias retrocompatível — preferir `listSessionPresence`. */
export async function listSessionCheckIns(
  sessionId: string,
): Promise<SessionPresenceResult> {
  return listSessionPresence(sessionId);
}
