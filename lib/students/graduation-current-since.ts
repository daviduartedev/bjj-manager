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
  weight_kg?: number | null;
};

export type CurrentBeltDegreeGraduationMeta = {
  configuredAtYmd: string;
  weightKg: number | null;
};

function graduationCalendarDay(graduatedAtIso: string): string | null {
  const d = new Date(graduatedAtIso);
  if (Number.isNaN(d.getTime())) return null;
  return toCalendarDateStringInAppTZ(d);
}

/** Último evento de graduação que estabeleceu o par (faixa, grau) actual. */
export function currentBeltDegreeGraduationMeta(
  graduations: GraduationTimelineRow[],
  currentBeltId: string,
  currentDegree: number,
): CurrentBeltDegreeGraduationMeta | null {
  const sorted = [...graduations].sort(
    (a, b) =>
      new Date(a.graduated_at).getTime() - new Date(b.graduated_at).getTime(),
  );

  const degree = Number(currentDegree);
  let last: GraduationTimelineRow | null = null;
  for (const g of sorted) {
    if (
      g.resulting_belt_id === currentBeltId &&
      Number(g.resulting_degree) === degree
    ) {
      last = g;
    }
  }
  if (!last) return null;

  const configuredAtYmd = graduationCalendarDay(last.graduated_at);
  if (!configuredAtYmd) return null;

  const weightRaw = last.weight_kg;
  const weightKg =
    weightRaw != null && Number.isFinite(Number(weightRaw))
      ? Number(weightRaw)
      : null;

  return { configuredAtYmd, weightKg };
}

export function calendarDateWhenCurrentBeltDegreeEstablished(
  graduations: GraduationTimelineRow[],
  currentBeltId: string,
  currentDegree: number,
): string | null {
  return (
    currentBeltDegreeGraduationMeta(
      graduations,
      currentBeltId,
      currentDegree,
    )?.configuredAtYmd ?? null
  );
}
