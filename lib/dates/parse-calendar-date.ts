import { TZDate } from "@date-fns/tz";

import { APP_TIME_ZONE } from "./constants";

export type CalendarDateInput = string | Date;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Extrai Y/M/D civis em São Paulo a partir de um instante JS. */
function calendarPartsFromJsDate(d: Date): { y: number; m0: number; d: number } {
  const z = new TZDate(d.getTime(), APP_TIME_ZONE);
  return { y: z.getFullYear(), m0: z.getMonth(), d: z.getDate() };
}

function isValidYMD(y: number, m0: number, day: number): boolean {
  const z = new TZDate(y, m0, day, APP_TIME_ZONE);
  return z.getFullYear() === y && z.getMonth() === m0 && z.getDate() === day;
}

/**
 * Converte `YYYY-MM-DD` (Postgres `date`) ou `Date` para meia-noite civil em São Paulo.
 * Não usa `parseISO` em strings só-data, evita deslocamento UTC (DATE-2.1).
 */
export function parseCalendarDate(
  input: CalendarDateInput | null | undefined,
): TZDate | null {
  if (input === null || input === undefined) return null;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    const m = ISO_DATE.exec(s);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const m0 = mo - 1;
    if (!isValidYMD(y, m0, d)) return null;
    return new TZDate(y, m0, d, APP_TIME_ZONE);
  }

  const { y, m0, d } = calendarPartsFromJsDate(input);
  if (!isValidYMD(y, m0, d)) return null;
  return new TZDate(y, m0, d, APP_TIME_ZONE);
}

/**
 * `YYYY-MM-DD` da meia-noite civil em SP para o instante dado (ex.: `new Date()` na UI).
 */
export function toCalendarDateStringInAppTZ(d: Date): string {
  const { y, m0, d: day } = calendarPartsFromJsDate(d);
  return `${y}-${String(m0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
