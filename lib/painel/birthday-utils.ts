/**
 * Aniversário no dia civil corrente (comparação MM-DD das strings YYYY-MM-DD).
 */
export function isBirthdayToday(birthYmd: string | null | undefined, todayYmd: string): boolean {
  if (!birthYmd || birthYmd.length < 10) return false;
  return birthYmd.slice(5, 10) === todayYmd.slice(5, 10);
}

/**
 * Aniversário no mês civil corrente (comparação MM).
 */
export function isBirthdayThisCalendarMonth(
  birthYmd: string | null | undefined,
  todayYmd: string,
): boolean {
  if (!birthYmd || birthYmd.length < 10) return false;
  return birthYmd.slice(5, 7) === todayYmd.slice(5, 7);
}
