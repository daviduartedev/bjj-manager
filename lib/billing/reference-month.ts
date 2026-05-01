import { TZDate } from "@date-fns/tz";

import { APP_TIME_ZONE } from "@/lib/dates/constants";
import { parseCalendarDate } from "@/lib/dates/parse-calendar-date";

/**
 * Normaliza qualquer data civil válida para o **dia 1** do mesmo mês (**BR-3.1**, **PBS-1.1**).
 */
export function normalizeReferenceMonth(input: string): string | null {
  const d = parseCalendarDate(input.trim());
  if (!d) return null;
  const y = d.getFullYear();
  const m0 = d.getMonth();
  return `${y}-${String(m0 + 1).padStart(2, "0")}-01`;
}

/**
 * Data civil de vencimento no mês de referência (**PBS-2.1**, **BR-2.3**).
 */
export function dueDateInReferenceMonth(
  referenceMonthFirstDay: string,
  dueDay: number,
): string | null {
  const ref = parseCalendarDate(referenceMonthFirstDay);
  if (!ref) return null;
  const y = ref.getFullYear();
  const m0 = ref.getMonth();
  const lastDayOfM = new TZDate(y, m0 + 1, 0, APP_TIME_ZONE).getDate();
  const day = Math.min(dueDay, lastDayOfM);
  return `${y}-${String(m0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Comparação lexicográfica de `YYYY-MM-DD`. */
export function compareIsoDateStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Para meses de referência **anteriores** ao mês civil actual, usa o **último dia**
 * desse mês como «hoje» na derivação (**BUI-3**). Caso contrário, `actualTodayYmd`.
 */
export function billingComparisonDateIso(
  referenceMonthFirstDay: string,
  actualTodayYmd: string,
): string {
  const ref = parseCalendarDate(referenceMonthFirstDay.trim());
  const cur = parseCalendarDate(actualTodayYmd.trim());
  if (!ref || !cur) return actualTodayYmd;
  const refYm = ref.getFullYear() * 12 + ref.getMonth();
  const curYm = cur.getFullYear() * 12 + cur.getMonth();
  if (refYm < curYm) {
    const y = ref.getFullYear();
    const m0 = ref.getMonth();
    const lastDay = new TZDate(y, m0 + 1, 0, APP_TIME_ZONE).getDate();
    return `${y}-${String(m0 + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }
  return actualTodayYmd;
}
