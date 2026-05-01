import { tz } from "@date-fns/tz";
import { differenceInCalendarDays, differenceInYears } from "date-fns";

import { APP_TIME_ZONE } from "./constants";
import { parseCalendarDate, type CalendarDateInput } from "./parse-calendar-date";

const inSP = { in: tz(APP_TIME_ZONE) } as const;

export function calculateAge(
  birthDate: CalendarDateInput | null | undefined,
  today: CalendarDateInput,
): number | null {
  const birth = parseCalendarDate(birthDate);
  const ref = parseCalendarDate(today);
  if (!birth || !ref) return null;
  if (differenceInCalendarDays(ref, birth, inSP) < 0) return null;
  return differenceInYears(ref, birth, inSP);
}
