import { toCalendarDateStringInAppTZ } from "@/lib/dates/parse-calendar-date";

/**
 * SPR-7.2, última data civil em que o par (faixa, grau) passou a coincidir com o estado actual,
 * percorrendo graduações em ordem cronológica ascendente.
 */
export type GraduationTimelineRow = {
  resulting_belt_id: string;
  resulting_degree: number;
  /** ISO instant from Postgres `timestamptz` */
  graduated_at: string;
};

function graduationCalendarDay(graduatedAtIso: string): string | null {
  const d = new Date(graduatedAtIso);
  if (Number.isNaN(d.getTime())) return null;
  return toCalendarDateStringInAppTZ(d);
}

export function calendarDateWhenCurrentBeltDegreeEstablished(
  graduations: GraduationTimelineRow[],
  currentBeltId: string,
  currentDegree: number,
): string | null {
  const sorted = [...graduations].sort(
    (a, b) =>
      new Date(a.graduated_at).getTime() - new Date(b.graduated_at).getTime(),
  );

  let last: string | null = null;
  const degree = Number(currentDegree);
  for (const g of sorted) {
    if (
      g.resulting_belt_id === currentBeltId &&
      Number(g.resulting_degree) === degree
    ) {
      last = graduationCalendarDay(g.graduated_at);
    }
  }
  return last;
}
