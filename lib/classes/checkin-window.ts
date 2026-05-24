import { TZDate } from "@date-fns/tz";

import {
  APP_TIME_ZONE,
  CHECKIN_WINDOW_HOURS_BEFORE,
} from "@/lib/classes/constants";

export type CheckinWindowState = "not_yet_open" | "open" | "closed";

/** Combina `session_date` + `start_time` (Postgres `time`) no fuso **APP_TIME_ZONE**. */
export function parseSessionStartInstant(
  sessionDate: string,
  startTime: string,
): TZDate {
  const [year, month, day] = sessionDate.split("-").map(Number);
  const timeParts = startTime.split(":");
  const hours = Number(timeParts[0] ?? 0);
  const minutes = Number(timeParts[1] ?? 0);
  const seconds = Number(timeParts[2] ?? 0);
  return new TZDate(year, month - 1, day, hours, minutes, seconds, APP_TIME_ZONE);
}

/**
 * Estado da janela de check-in (**SPT-5.1**, D3):
 * abre 6h antes de `start_time`; fecha no início da aula.
 */
export function getCheckinWindowState(
  sessionDate: string,
  startTime: string,
  now: Date = new Date(),
): CheckinWindowState {
  const start = parseSessionStartInstant(sessionDate, startTime);
  const nowTz = new TZDate(now.getTime(), APP_TIME_ZONE);

  const windowOpens = new TZDate(start.getTime(), APP_TIME_ZONE);
  windowOpens.setHours(windowOpens.getHours() - CHECKIN_WINDOW_HOURS_BEFORE);

  if (nowTz.getTime() < windowOpens.getTime()) return "not_yet_open";
  if (nowTz.getTime() >= start.getTime()) return "closed";
  return "open";
}

export function isCheckinWindowOpen(
  sessionDate: string,
  startTime: string,
  now: Date = new Date(),
): boolean {
  return getCheckinWindowState(sessionDate, startTime, now) === "open";
}
