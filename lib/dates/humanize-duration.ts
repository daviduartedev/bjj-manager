import { tz } from "@date-fns/tz";
import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
} from "date-fns";

import { APP_TIME_ZONE } from "./constants";
import { joinWithE, pluralUnitPT } from "./pt-parts";
import { parseCalendarDate, type CalendarDateInput } from "./parse-calendar-date";

const inSP = { in: tz(APP_TIME_ZONE) } as const;

export function humanizeDuration(params: {
  from: CalendarDateInput;
  to: CalendarDateInput;
}): string | null {
  const from = parseCalendarDate(params.from);
  const to = parseCalendarDate(params.to);
  if (!from || !to) return null;

  const totalDays = differenceInCalendarDays(to, from, inSP);
  if (totalDays < 0) return null;

  const monthsTotal = differenceInCalendarMonths(to, from, inSP);

  if (monthsTotal >= 1) {
    const years = differenceInCalendarYears(to, from, inSP);
    const afterYears = addYears(from, years, inSP);
    const months = differenceInCalendarMonths(to, afterYears, inSP);
    const afterMonths = addMonths(afterYears, months, inSP);
    const days = differenceInCalendarDays(to, afterMonths, inSP);

    const parts: string[] = [];
    if (years > 0) parts.push(pluralUnitPT(years, "ano", "anos"));
    if (months > 0) parts.push(pluralUnitPT(months, "mês", "meses"));
    if (days > 0) parts.push(pluralUnitPT(days, "dia", "dias"));

    if (parts.length === 0) return "menos de 1 dia";
    return joinWithE(parts);
  }

  if (totalDays === 0) return "menos de 1 dia";
  if (totalDays < 7) return pluralUnitPT(totalDays, "dia", "dias");

  const weeks = Math.floor(totalDays / 7);
  const remDays = totalDays % 7;
  const wPart = pluralUnitPT(weeks, "semana", "semanas");
  if (remDays === 0) return wPart;
  return joinWithE([wPart, pluralUnitPT(remDays, "dia", "dias")]);
}
