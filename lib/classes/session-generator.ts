import { TZDate } from "@date-fns/tz";

import {
  APP_TIME_ZONE,
  ISO_WEEKDAY_MAX,
  ISO_WEEKDAY_MIN,
  SESSION_GENERATION_HORIZON_DAYS,
} from "@/lib/classes/constants";

export type RecurringScheduleRow = {
  classId: string;
  accountId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type ClassSessionInsert = {
  classId: string;
  accountId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
};

/** Converte `Date#getDay()` (0=dom … 6=sáb) para ISO 8601 (1=seg … 7=dom). */
export function jsDayToIsoWeekday(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

function formatSessionDate(d: TZDate): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Expande um horário recorrente em instâncias concretas para os próximos `horizonDays`
 * dias civis a partir de `fromDate` (timezone **APP_TIME_ZONE**).
 * Idempotente: mesma entrada ⇒ mesmas chaves `(class_id, session_date, start_time)`.
 */
export function expandSessionsForSchedule(
  schedule: RecurringScheduleRow,
  fromDate: Date,
  horizonDays: number = SESSION_GENERATION_HORIZON_DAYS,
): ClassSessionInsert[] {
  if (
    schedule.dayOfWeek < ISO_WEEKDAY_MIN ||
    schedule.dayOfWeek > ISO_WEEKDAY_MAX
  ) {
    throw new Error(`dayOfWeek inválido: ${schedule.dayOfWeek}`);
  }

  const start = new TZDate(fromDate.getTime(), APP_TIME_ZONE);
  start.setHours(0, 0, 0, 0);

  const sessions: ClassSessionInsert[] = [];
  const seen = new Set<string>();

  for (let offset = 0; offset < horizonDays; offset += 1) {
    const day = new TZDate(start.getTime(), APP_TIME_ZONE);
    day.setDate(start.getDate() + offset);

    if (jsDayToIsoWeekday(day.getDay()) !== schedule.dayOfWeek) continue;

    const sessionDate = formatSessionDate(day);
    const key = `${schedule.classId}|${sessionDate}|${schedule.startTime}`;
    if (seen.has(key)) continue;
    seen.add(key);

    sessions.push({
      classId: schedule.classId,
      accountId: schedule.accountId,
      sessionDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
  }

  return sessions;
}

/** Expande vários horários recorrentes (ex.: turma com múltiplos dias). */
export function expandSessionsForSchedules(
  schedules: RecurringScheduleRow[],
  fromDate: Date,
  horizonDays: number = SESSION_GENERATION_HORIZON_DAYS,
): ClassSessionInsert[] {
  const merged = new Map<string, ClassSessionInsert>();

  for (const schedule of schedules) {
    for (const session of expandSessionsForSchedule(schedule, fromDate, horizonDays)) {
      const key = `${session.classId}|${session.sessionDate}|${session.startTime}`;
      merged.set(key, session);
    }
  }

  return [...merged.values()].sort((a, b) => {
    const dateCmp = a.sessionDate.localeCompare(b.sessionDate);
    if (dateCmp !== 0) return dateCmp;
    return a.startTime.localeCompare(b.startTime);
  });
}
