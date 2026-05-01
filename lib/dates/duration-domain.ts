import type { CalendarDateInput } from "./parse-calendar-date";
import { humanizeDuration } from "./humanize-duration";

export function timeSinceJoined(
  joinedAt: CalendarDateInput | null | undefined,
  today: CalendarDateInput,
): string | null {
  if (joinedAt === null || joinedAt === undefined) return null;
  return humanizeDuration({ from: joinedAt, to: today });
}

export function timeAtCurrentBelt(
  currentBeltStartedAt: CalendarDateInput | null | undefined,
  today: CalendarDateInput,
): string | null {
  if (currentBeltStartedAt === null || currentBeltStartedAt === undefined) return null;
  return humanizeDuration({ from: currentBeltStartedAt, to: today });
}

export function timeAtCurrentDegree(
  currentDegreeStartedAt: CalendarDateInput | null | undefined,
  today: CalendarDateInput,
): string | null {
  if (currentDegreeStartedAt === null || currentDegreeStartedAt === undefined)
    return null;
  return humanizeDuration({ from: currentDegreeStartedAt, to: today });
}
