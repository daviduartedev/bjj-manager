import { tz } from "@date-fns/tz";
import { addMonths, addYears, differenceInCalendarDays } from "date-fns";

import { APP_TIME_ZONE } from "@/lib/dates/constants";
import { parseCalendarDate } from "@/lib/dates/parse-calendar-date";
import { calendarDaysBetween } from "@/lib/students/graduation-reference";

const inSP = { in: tz(APP_TIME_ZONE) } as const;

export const KIDS_DEGREE_MONTHS = [1, 3, 4] as const;
export type KidsDegreeMonths = (typeof KIDS_DEGREE_MONTHS)[number];

export type ReadinessCriterion =
  | { confirmed: false }
  | { confirmed: true; kidsDegreeMonths: KidsDegreeMonths };

export type ReadinessAlertInput = {
  criterion: ReadinessCriterion;
  beltSlug: string;
  beltKind: "adult" | "kids";
  studentKind: "adult" | "kids" | "baby";
  beltStartYmd: string | null;
  degreeStartYmd: string | null;
  todayYmd: string;
};

function isKidsDegreeMonths(value: number): value is KidsDegreeMonths {
  return value === 1 || value === 3 || value === 4;
}

/** Conta sem aceite → fallback 4/12; aceite sem cadência válida também cai no fallback. */
export function criterionFromAccount(row: {
  readiness_confirmed_at: string | null;
  readiness_kids_degree_months: number | null;
}): ReadinessCriterion {
  if (!row.readiness_confirmed_at) return { confirmed: false };
  const months = row.readiness_kids_degree_months;
  if (months == null || !isKidsDegreeMonths(months)) return { confirmed: false };
  return { confirmed: true, kidsDegreeMonths: months };
}

function usesKidsCadence(
  studentKind: ReadinessAlertInput["studentKind"],
  beltKind: ReadinessAlertInput["beltKind"],
): boolean {
  if (studentKind === "kids") return true;
  return studentKind === "baby" && beltKind === "kids";
}

function isOutOfSeries(beltSlug: string, beltKind: "adult" | "kids"): boolean {
  if (beltKind !== "adult") return false;
  return beltSlug === "black" || beltSlug === "coral";
}

function reachedAfterCalendarShift(
  startYmd: string | null,
  todayYmd: string,
  shift: (start: Date) => Date,
): boolean {
  if (!startYmd) return false;
  const start = parseCalendarDate(startYmd);
  const today = parseCalendarDate(todayYmd);
  if (!start || !today) return false;
  const due = shift(start);
  return differenceInCalendarDays(today, due, inSP) >= 0;
}

function reachedAfterCalendarMonths(
  startYmd: string | null,
  todayYmd: string,
  months: number,
): boolean {
  return reachedAfterCalendarShift(startYmd, todayYmd, (start) =>
    addMonths(start, months, inSP),
  );
}

function adultBeltDueShift(beltSlug: string): ((start: Date) => Date) | null {
  if (beltSlug === "blue") return (start) => addYears(start, 2, inSP);
  if (beltSlug === "purple") return (start) => addMonths(start, 18, inSP);
  if (beltSlug === "brown") return (start) => addYears(start, 1, inSP);
  return null;
}

function adultBeltIntervalDays(
  beltSlug: string,
  beltStartYmd: string,
): number | null {
  const start = parseCalendarDate(beltStartYmd);
  const shift = adultBeltDueShift(beltSlug);
  if (!start || !shift) return null;
  return differenceInCalendarDays(shift(start), start, inSP);
}

function reachedDegreeDays(
  degreeStartYmd: string | null,
  todayYmd: string,
  minDays: number,
): boolean {
  if (!degreeStartYmd) return false;
  const days = calendarDaysBetween(degreeStartYmd, todayYmd);
  return days !== null && days >= minDays;
}

function fallbackFourTwelve(
  beltStartYmd: string | null,
  degreeStartYmd: string | null,
  todayYmd: string,
): boolean {
  return (
    reachedAfterCalendarMonths(degreeStartYmd, todayYmd, 4) ||
    reachedAfterCalendarMonths(beltStartYmd, todayYmd, 12)
  );
}

/**
 * Alerta de graduação segundo o critério de prontidão da academia.
 * Preta e coral adultas nunca entram.
 */
export function meetsReadinessAlert(input: ReadinessAlertInput): boolean {
  const {
    criterion,
    beltSlug,
    beltKind,
    studentKind,
    beltStartYmd,
    degreeStartYmd,
    todayYmd,
  } = input;

  if (isOutOfSeries(beltSlug, beltKind)) return false;

  if (!criterion.confirmed) {
    return fallbackFourTwelve(beltStartYmd, degreeStartYmd, todayYmd);
  }

  if (usesKidsCadence(studentKind, beltKind)) {
    const grauMonths = criterion.kidsDegreeMonths;
    return (
      reachedAfterCalendarMonths(degreeStartYmd, todayYmd, grauMonths) ||
      reachedAfterCalendarMonths(beltStartYmd, todayYmd, grauMonths * 4)
    );
  }

  if (beltSlug === "white") {
    return reachedAfterCalendarMonths(degreeStartYmd, todayYmd, 4);
  }

  const shift = adultBeltDueShift(beltSlug);
  if (!shift) return false;

  if (reachedAfterCalendarShift(beltStartYmd, todayYmd, shift)) return true;

  if (!beltStartYmd) return false;
  const intervalDays = adultBeltIntervalDays(beltSlug, beltStartYmd);
  if (intervalDays == null) return false;
  return reachedDegreeDays(degreeStartYmd, todayYmd, intervalDays / 4);
}
