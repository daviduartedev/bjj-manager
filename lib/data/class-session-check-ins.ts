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
};

export type SessionCheckInsResult =
  | { ok: true; session: SessionInfo; checkIns: SessionCheckInRow[] }
  | { ok: false; error: string };

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

export async function listSessionCheckIns(
  sessionId: string,
): Promise<SessionCheckInsResult> {
  const supabase = await createClient();

  const { data: sessionData, error: sessionError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
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

  const { data: checkInsData, error: checkInsError } = await supabase
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
    .order("created_at", { ascending: true });

  if (checkInsError) {
    return { ok: false, error: "Não foi possível carregar os check-ins." };
  }

  const rows = checkInsData ?? [];
  if (rows.length === 0) {
    return { ok: true, session, checkIns: [] };
  }

  const todayYmd = toCalendarDateStringInAppTZ(new Date());
  const referenceMonthFirstDay =
    normalizeReferenceMonth(`${todayYmd.slice(0, 7)}-01`) ?? `${todayYmd.slice(0, 7)}-01`;

  const studentIds = rows.map((r) => r.student_id as string);
  const billingSnapshots = await fetchMonthBillingSnapshots({
    supabase,
    studentIds,
    referenceMonthFirstDay,
    today: todayYmd,
  });

  const indicatorByStudentId = new Map(
    billingSnapshots.map((s) => [s.studentId, s.indicator]),
  );

  const checkIns: SessionCheckInRow[] = rows.map((r) => {
    const studentRel = relationOne(
      r.students as
        | { full_name: string }
        | { full_name: string }[]
        | null,
    );
    return {
      checkInId: r.id as string,
      studentId: r.student_id as string,
      studentName: studentRel?.full_name ?? "Aluno",
      checkedInAt: r.created_at as string,
      billingIndicator: indicatorByStudentId.get(r.student_id as string) ?? "pending",
    };
  });

  return { ok: true, session, checkIns };
}
