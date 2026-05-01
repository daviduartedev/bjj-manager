import {
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
} from "date-fns";
import { tz } from "@date-fns/tz";

import { APP_TIME_ZONE } from "./constants";
import { joinWithE, pluralUnitPT } from "./pt-parts";
import { parseCalendarDate, type CalendarDateInput } from "./parse-calendar-date";

const inSP = { in: tz(APP_TIME_ZONE) } as const;

const MONTH_ABBR = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

/** DATE-6.1, ex.: "12 abr 2024". */
export function formatDateBR(date: CalendarDateInput | null | undefined): string | null {
  const d = parseCalendarDate(date);
  if (!d) return null;
  const day = d.getDate();
  const month = MONTH_ABBR[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/** DATE-7, relativos ao passado; futuro → null; mesmo dia → "hoje". */
export function formatRelativeBR(
  date: CalendarDateInput | null | undefined,
  today: CalendarDateInput,
): string | null {
  const past = parseCalendarDate(date);
  const ref = parseCalendarDate(today);
  if (!past || !ref) return null;

  const totalDays = differenceInCalendarDays(ref, past, inSP);
  if (totalDays < 0) return null;
  if (totalDays === 0) return "hoje";

  const years = differenceInCalendarYears(ref, past, inSP);
  if (years >= 1) {
    const afterYears = addYears(past, years, inSP);
    const months = differenceInCalendarMonths(ref, afterYears, inSP);
    const yPart = pluralUnitPT(years, "ano", "anos");
    if (months > 0) {
      return `há ${joinWithE([yPart, pluralUnitPT(months, "mês", "meses")])}`;
    }
    return `há ${yPart}`;
  }

  const months = differenceInCalendarMonths(ref, past, inSP);
  if (months >= 1) {
    return `há ${pluralUnitPT(months, "mês", "meses")}`;
  }

  if (totalDays >= 7) {
    const weeks = Math.floor(totalDays / 7);
    const rem = totalDays % 7;
    const wPart = pluralUnitPT(weeks, "semana", "semanas");
    if (rem === 0) return `há ${wPart}`;
    return `há ${joinWithE([wPart, pluralUnitPT(rem, "dia", "dias")])}`;
  }

  return `há ${pluralUnitPT(totalDays, "dia", "dias")}`;
}
