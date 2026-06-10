import { timeAtCurrentDegree } from "@/lib/dates/duration-domain";

import {
  resolveDegreeStart,
  type GraduationRecordInput,
} from "./graduation-reference";

/**
 * Linha auxiliar **STU-7.4** (lista `/alunos`): apenas tempo no **grau actual**,
 * a partir da última graduação que estabeleceu o par (faixa, grau) vigente.
 */
export function studentGraduationDurationLine(
  grads: GraduationRecordInput[],
  currentBeltId: string,
  currentDegree: number,
  academyStartYmd: string | null,
  todayYmd: string,
): string | null {
  const degR = resolveDegreeStart(
    grads,
    currentBeltId,
    currentDegree,
    academyStartYmd,
  );
  const degHum =
    degR.startYmd != null
      ? timeAtCurrentDegree(degR.startYmd, todayYmd)
      : null;
  if (!degHum) return null;
  return `${degHum}${degR.approximate ? " (aprox.)" : ""}`;
}
