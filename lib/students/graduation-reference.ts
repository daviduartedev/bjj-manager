import { tz } from "@date-fns/tz";
import { differenceInCalendarDays } from "date-fns";

import { APP_TIME_ZONE } from "@/lib/dates/constants";
import { parseCalendarDate, toCalendarDateStringInAppTZ } from "@/lib/dates/parse-calendar-date";

const inSP = { in: tz(APP_TIME_ZONE) } as const;

export type GraduationRecordInput = {
  resulting_belt_id: string;
  resulting_degree: number;
  /** Instant from DB (`timestamptz`). */
  graduated_at: string;
};

/**
 * Data civil (YYYY-MM-DD) em São Paulo do instante de graduação.
 */
export function graduationCalendarDateYmd(g: GraduationRecordInput): string | null {
  const d = new Date(g.graduated_at);
  if (Number.isNaN(d.getTime())) return null;
  return toCalendarDateStringInAppTZ(d);
}

/**
 * Ordena por `graduated_at` descendente (mais recente primeiro).
 */
export function sortGraduationsDesc(
  grads: GraduationRecordInput[],
): GraduationRecordInput[] {
  return [...grads].sort(
    (a, b) => new Date(b.graduated_at).getTime() - new Date(a.graduated_at).getTime(),
  );
}

export type ReferenceStartResult = {
  /** YYYY-MM-DD ou null se não há nem academia. */
  startYmd: string | null;
  /** Sem graduação correspondente — usou-se `academy_start_date`. */
  approximate: boolean;
};

/**
 * **PNL-4.4** — início da permanência na **faixa** actual.
 */
export function resolveBeltStart(
  grads: GraduationRecordInput[],
  currentBeltId: string,
  academyStartYmd: string | null | undefined,
): ReferenceStartResult {
  const sorted = sortGraduationsDesc(grads);
  const hit = sorted.find((g) => g.resulting_belt_id === currentBeltId);
  if (hit) {
    const ymd = graduationCalendarDateYmd(hit);
    if (ymd) return { startYmd: ymd, approximate: false };
  }
  const a = academyStartYmd?.trim() ?? "";
  if (a && /^\d{4}-\d{2}-\d{2}$/.test(a)) {
    return { startYmd: a, approximate: true };
  }
  return { startYmd: null, approximate: true };
}

/**
 * **PNL-4.3** — início do **grau** actual (par faixa+grau).
 */
export function resolveDegreeStart(
  grads: GraduationRecordInput[],
  currentBeltId: string,
  currentDegree: number,
  academyStartYmd: string | null | undefined,
): ReferenceStartResult {
  const sorted = sortGraduationsDesc(grads);
  const hit = sorted.find(
    (g) =>
      g.resulting_belt_id === currentBeltId && g.resulting_degree === currentDegree,
  );
  if (hit) {
    const ymd = graduationCalendarDateYmd(hit);
    if (ymd) return { startYmd: ymd, approximate: false };
  }
  const a = academyStartYmd?.trim() ?? "";
  if (a && /^\d{4}-\d{2}-\d{2}$/.test(a)) {
    return { startYmd: a, approximate: true };
  }
  return { startYmd: null, approximate: true };
}

/** Dias civis SP entre duas datas-only (inclusive semantics via date-fns). */
export function calendarDaysBetween(fromYmd: string, toYmd: string): number | null {
  const from = parseCalendarDate(fromYmd);
  const to = parseCalendarDate(toYmd);
  if (!from || !to) return null;
  return differenceInCalendarDays(to, from, inSP);
}

/** **PNL-4.2** — alerta se tempo no grau ≥120 dias OU na faixa ≥365 dias (até `todayYmd`). */
export function meetsGraduationAttentionThreshold(
  beltStartYmd: string | null,
  degreeStartYmd: string | null,
  todayYmd: string,
): boolean {
  if (degreeStartYmd) {
    const dDeg = calendarDaysBetween(degreeStartYmd, todayYmd);
    if (dDeg !== null && dDeg >= 120) return true;
  }
  if (beltStartYmd) {
    const dBelt = calendarDaysBetween(beltStartYmd, todayYmd);
    if (dBelt !== null && dBelt >= 365) return true;
  }
  return false;
}
