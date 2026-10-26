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

export type BirthdayListPerson = {
  fullName: string;
  birthDate: string | null | undefined;
};

export type BirthdayThisMonthRow = {
  fullName: string;
  dayMonth: string;
};

/** Dia/mês civil sem o ano (ex.: 12/10). */
function birthDayMonth(birthYmd: string): string {
  return `${birthYmd.slice(8, 10)}/${birthYmd.slice(5, 7)}`;
}

/**
 * Alunos cujo mês de nascimento coincide com o mês civil de `todayYmd`.
 * Quem não tem data de nascimento fica de fora. A ordem de entrada é preservada.
 */
export function listBirthdaysThisCalendarMonth(
  people: readonly BirthdayListPerson[],
  todayYmd: string,
): BirthdayThisMonthRow[] {
  const rows: BirthdayThisMonthRow[] = [];
  for (const person of people) {
    const birthYmd = person.birthDate;
    if (typeof birthYmd !== "string") continue;
    if (!isBirthdayThisCalendarMonth(birthYmd, todayYmd)) continue;
    rows.push({
      fullName: person.fullName,
      dayMonth: birthDayMonth(birthYmd),
    });
  }
  return rows;
}
