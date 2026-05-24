import { TZDate } from "@date-fns/tz";

import { getStudentForCurrentUser } from "@/lib/auth/student-context";
import { SESSION_LIST_HORIZON_DAYS } from "@/lib/classes/constants";
import { APP_TIME_ZONE } from "@/lib/dates/constants";
import {
  parseCalendarDate,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates/parse-calendar-date";
import { createClient } from "@/lib/supabase/server";

export type StudentClassSessionRow = {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  classKind: "adult" | "kids";
  instructorName: string;
  checkInId: string | null;
  checkInAt: string | null;
};

export type StudentClassSessionsResult =
  | { ok: true; sessions: StudentClassSessionRow[] }
  | { ok: false; error: string };

function addCalendarDaysYmd(ymd: string, days: number): string {
  const base = parseCalendarDate(ymd);
  if (!base) return ymd;
  const next = new TZDate(base.getTime(), APP_TIME_ZONE);
  next.setDate(next.getDate() + days);
  return toCalendarDateStringInAppTZ(new Date(next.getTime()));
}

function formatTimeHm(time: string): string {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

function relationOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

export async function listStudentClassSessions(): Promise<StudentClassSessionsResult> {
  const student = await getStudentForCurrentUser();
  if (!student) {
    return { ok: false, error: "Sessão de aluno inválida." };
  }

  const todayYmd = toCalendarDateStringInAppTZ(new Date());
  const endYmd = addCalendarDaysYmd(todayYmd, SESSION_LIST_HORIZON_DAYS);

  const supabase = await createClient();

  const { data: sessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      session_date,
      start_time,
      end_time,
      class_id,
      classes (
        name,
        kind,
        profiles!classes_instructor_profile_id_fkey (
          display_name
        )
      )
    `,
    )
    .gte("session_date", todayYmd)
    .lte("session_date", endYmd)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (sessionsError) {
    return { ok: false, error: "Não foi possível carregar as aulas." };
  }

  const rows = sessions ?? [];
  if (rows.length === 0) {
    return { ok: true, sessions: [] };
  }

  const sessionIds = rows.map((r) => r.id as string);
  const { data: checkIns, error: checkInsError } = await supabase
    .from("check_ins")
    .select("id, class_session_id, created_at")
    .eq("student_id", student.id)
    .in("class_session_id", sessionIds);

  if (checkInsError) {
    return { ok: false, error: "Não foi possível carregar os check-ins." };
  }

  const checkInBySession = new Map(
    (checkIns ?? []).map((c) => [
      c.class_session_id as string,
      { id: c.id as string, createdAt: c.created_at as string },
    ]),
  );

  const mapped: StudentClassSessionRow[] = [];

  for (const row of rows) {
    const classRel = relationOne(
      row.classes as
        | {
            name: string;
            kind: "adult" | "kids";
            profiles:
              | { display_name: string }
              | { display_name: string }[]
              | null;
          }
        | {
            name: string;
            kind: "adult" | "kids";
            profiles:
              | { display_name: string }
              | { display_name: string }[]
              | null;
          }[]
        | null,
    );
    if (!classRel) continue;

    const instructor = relationOne(classRel.profiles);
    const checkIn = checkInBySession.get(row.id as string);

    mapped.push({
      id: row.id as string,
      sessionDate: row.session_date as string,
      startTime: formatTimeHm(row.start_time as string),
      endTime: formatTimeHm(row.end_time as string),
      classId: row.class_id as string,
      className: classRel.name,
      classKind: classRel.kind,
      instructorName: instructor?.display_name ?? "Professor",
      checkInId: checkIn?.id ?? null,
      checkInAt: checkIn?.createdAt ?? null,
    });
  }

  return { ok: true, sessions: mapped };
}
