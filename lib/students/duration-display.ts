import { timeAtCurrentDegree } from "@/lib/dates/duration-domain";

import { calendarDateWhenCurrentBeltDegreeEstablished } from "./graduation-current-since";
import type { GraduationRecordInput } from "./graduation-reference";

/**
 * Linha auxiliar **STU-7.4** (lista `/alunos`): tempo no **grau actual** desde a
 * graduação que estabeleceu o par (faixa, grau) vigente — sem fallback na entrada na academia.
 */
export function studentGraduationDurationLine(
  grads: GraduationRecordInput[],
  currentBeltId: string,
  currentDegree: number,
  _academyStartYmd: string | null,
  todayYmd: string,
): string | null {
  const startYmd = calendarDateWhenCurrentBeltDegreeEstablished(
    grads,
    currentBeltId,
    currentDegree,
  );
  if (!startYmd) return null;

  const degHum = timeAtCurrentDegree(startYmd, todayYmd);
  if (!degHum) return null;
  return degHum;
}
