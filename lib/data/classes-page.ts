import { TZDate } from "@date-fns/tz";

import { SESSION_LIST_HORIZON_DAYS } from "@/lib/classes/constants";
import { APP_TIME_ZONE } from "@/lib/dates/constants";
import {
  parseCalendarDate,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates/parse-calendar-date";
import { createClient } from "@/lib/supabase/server";

export type ClassRow = {
  id: string;
  name: string;
  kind: "adult" | "kids";
  instructorProfileId: string;
  instructorName: string;
  enrollmentCount: number;
};

export type ScheduleRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type EnrollmentRow = {
  id: string;
  studentId: string;
  studentName: string;
  enrolledAt: string;
};

export type ClassDetailRow = {
  id: string;
  name: string;
  kind: "adult" | "kids";
  instructorProfileId: string;
  instructorName: string;
  schedules: ScheduleRow[];
  enrollments: EnrollmentRow[];
};

export type UpcomingSessionRow = {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  classKind: "adult" | "kids";
  checkInCount: number;
};

function formatTimeHm(time: string): string {
  const [h, m] = time.split(":");
  return `${h}:${m}`;
}

function relationOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

function addDaysToYmd(ymd: string, days: number): string {
  const base = parseCalendarDate(ymd);
  if (!base) return ymd;
  const next = new TZDate(base.getTime(), APP_TIME_ZONE);
  next.setDate(next.getDate() + days);
  return toCalendarDateStringInAppTZ(new Date(next.getTime()));
}

export async function listClasses(): Promise<ClassRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select(
      `
      id,
      name,
      kind,
      instructor_profile_id,
      profiles!classes_instructor_profile_id_fkey ( display_name ),
      student_class_enrollments ( id )
    `,
    )
    .order("name", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const instructor = relationOne(
      row.profiles as
        | { display_name: string }
        | { display_name: string }[]
        | null,
    );
    const enrollments = (row.student_class_enrollments as { id: string }[] | null) ?? [];
    return {
      id: row.id as string,
      name: row.name as string,
      kind: row.kind as "adult" | "kids",
      instructorProfileId: row.instructor_profile_id as string,
      instructorName: instructor?.display_name ?? "Professor",
      enrollmentCount: enrollments.length,
    };
  });
}

export async function getClassDetail(classId: string): Promise<ClassDetailRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select(
      `
      id,
      name,
      kind,
      instructor_profile_id,
      profiles!classes_instructor_profile_id_fkey ( display_name ),
      class_recurring_schedules ( id, day_of_week, start_time, end_time ),
      student_class_enrollments (
        id,
        student_id,
        enrolled_at,
        students ( full_name )
      )
    `,
    )
    .eq("id", classId)
    .maybeSingle();

  if (error || !data) return null;

  const instructor = relationOne(
    data.profiles as
      | { display_name: string }
      | { display_name: string }[]
      | null,
  );

  const scheduleRows = (
    data.class_recurring_schedules as
      | { id: string; day_of_week: number; start_time: string; end_time: string }[]
      | null
  ) ?? [];

  const enrollmentRows = (
    data.student_class_enrollments as
      | {
          id: string;
          student_id: string;
          enrolled_at: string;
          students: { full_name: string } | { full_name: string }[] | null;
        }[]
      | null
  ) ?? [];

  return {
    id: data.id as string,
    name: data.name as string,
    kind: data.kind as "adult" | "kids",
    instructorProfileId: data.instructor_profile_id as string,
    instructorName: instructor?.display_name ?? "Professor",
    schedules: scheduleRows.map((s) => ({
      id: s.id,
      dayOfWeek: s.day_of_week,
      startTime: formatTimeHm(s.start_time),
      endTime: formatTimeHm(s.end_time),
    })),
    enrollments: enrollmentRows.map((e) => {
      const student = relationOne(e.students);
      return {
        id: e.id,
        studentId: e.student_id,
        studentName: (student as { full_name: string } | null)?.full_name ?? "Aluno",
        enrolledAt: e.enrolled_at,
      };
    }),
  };
}

export async function listUpcomingSessions(): Promise<UpcomingSessionRow[]> {
  const supabase = await createClient();
  const todayYmd = toCalendarDateStringInAppTZ(new Date());
  const endYmd = addDaysToYmd(todayYmd, SESSION_LIST_HORIZON_DAYS);

  const { data: sessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select(
      `
      id,
      session_date,
      start_time,
      end_time,
      class_id,
      classes ( name, kind ),
      check_ins ( id )
    `,
    )
    .gte("session_date", todayYmd)
    .lte("session_date", endYmd)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (sessionsError || !sessions) return [];

  return sessions.map((row) => {
    const classRel = relationOne(
      row.classes as
        | { name: string; kind: "adult" | "kids" }
        | { name: string; kind: "adult" | "kids" }[]
        | null,
    );
    const checkIns = (row.check_ins as { id: string }[] | null) ?? [];
    return {
      id: row.id as string,
      sessionDate: row.session_date as string,
      startTime: formatTimeHm(row.start_time as string),
      endTime: formatTimeHm(row.end_time as string),
      classId: row.class_id as string,
      className: classRel?.name ?? "Turma",
      classKind: (classRel?.kind ?? "adult") as "adult" | "kids",
      checkInCount: checkIns.length,
    };
  });
}
