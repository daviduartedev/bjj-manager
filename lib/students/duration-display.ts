import { timeAtCurrentBelt, timeAtCurrentDegree } from "@/lib/dates/duration-domain";

import {
  resolveBeltStart,
  resolveDegreeStart,
  type GraduationRecordInput,
} from "./graduation-reference";

/**
 * Linha auxiliar **STU-7.4**, mesma lógica de referência que **PNL-4.3** / **PNL-4.4**.
 */
export function studentGraduationDurationLine(
  grads: GraduationRecordInput[],
  currentBeltId: string,
  currentDegree: number,
  academyStartYmd: string | null,
  todayYmd: string,
): string | null {
  const beltR = resolveBeltStart(grads, currentBeltId, academyStartYmd);
  const degR = resolveDegreeStart(
    grads,
    currentBeltId,
    currentDegree,
    academyStartYmd,
  );
  const beltHum =
    beltR.startYmd != null
      ? timeAtCurrentBelt(beltR.startYmd, todayYmd)
      : null;
  const degHum =
    degR.startYmd != null
      ? timeAtCurrentDegree(degR.startYmd, todayYmd)
      : null;
  if (!beltHum && !degHum) return null;
  const parts: string[] = [];
  if (beltHum) {
    parts.push(`Na faixa: ${beltHum}${beltR.approximate ? " (aprox.)" : ""}`);
  }
  if (degHum) {
    parts.push(`No grau: ${degHum}${degR.approximate ? " (aprox.)" : ""}`);
  }
  return parts.join(" · ");
}
