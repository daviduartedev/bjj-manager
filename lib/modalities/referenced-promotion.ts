import { calculateAge, parseCalendarDate } from "@/lib/dates";
import { findReferencedRank, JUDO_REFERENCE } from "./referenced-ranks";

export type RankPromotionRow = {
  id: string;
  reference_id: string;
  from_rank_code: string;
  from_rank_date: string | null;
  to_rank_code: string;
  granted_on: string;
  was_skip: boolean;
  reason: string | null;
  guidance_exceptions: string[];
  guidance_basis: string;
};

/** Orientação padrão da edição adotada, não uma decisão de homologação. */
export function assessJudoPromotion(input: { fromCode: string; fromDate: string | null; toCode: string; birthDate: string; date: string }) {
  const from = findReferencedRank(JUDO_REFERENCE.id, input.fromCode);
  const to = findReferencedRank(JUDO_REFERENCE.id, input.toCode);
  const exceptions: string[] = [];
  const guidance: string[] = [];
  if (!from || !to || !parseCalendarDate(input.date)) return { wasSkip: false, exceptions, guidance };
  const age = calculateAge(input.birthDate, input.date) ?? 0;
  const yearAge = Number(input.date.slice(0, 4)) - Number(input.birthDate.slice(0, 4));
  let months = 0;
  if (to.ordinal <= 7 && age > 16) {
    guidance.push("CBJ 2023, p.7, tabela 1 e §5: acima de 16 anos, faixas básicas dispensam sequência e carência. Justificativa de salto é rastreabilidade Casca.");
  } else if (to.ordinal < 12) {
    const basic = to.ordinal <= 7;
    const minimumAge = basic ? [4, 5, 6, 7, 8, 9, 10][to.ordinal - 1] : to.ordinal + 3;
    months = basic ? [3, 3, 6, 6, 6, 6, 12][to.ordinal - 1] : 12;
    guidance.push(`CBJ 2023, p.7, tabela ${basic ? 1 : 2}, linha ${to.label}: idade mínima ${minimumAge} anos por ano de nascimento (§2); interstício padrão de ${months} meses na graduação anterior.`);
    if (yearAge < minimumAge) exceptions.push("Idade abaixo da orientação padrão CBJ.");
  } else {
    const dan = to.ordinal - 11;
    const minimumAge = [16, 20, 25, 30, 36, 44, 52, 59, 66, 74][dan - 1];
    months = [age > 20 ? 12 : 24, 48, 60, 60, 72, 72, 84, 84, 96, 96][dan - 1];
    guidance.push(`CBJ 2023, p.8, tabela ${dan <= 5 ? 3 : dan <= 7 ? 4 : 5}, linha ${dan}º dan: idade mínima ${minimumAge} anos; interstício padrão ${months / 12} ano(s) na graduação anterior. Idade por ano de nascimento (p.7 §2), salvo 1º dan aos 16 completos; no 1º dan, acima de 20 completos o interstício é 1 ano.`);
    if ((dan === 1 ? age : yearAge) < minimumAge) exceptions.push("Idade abaixo da orientação padrão CBJ.");
  }
  if (months) {
    if (!input.fromDate) guidance.push("Carência indeterminável: data da graduação anterior desconhecida. A entrada na academia não é usada.");
    else {
      const [y, m, d] = input.fromDate.split("-").map(Number);
      const end = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
      const target = new Date(Date.UTC(y, m - 1 + months, Math.min(d, end))).toISOString().slice(0, 10);
      if (input.date < target) exceptions.push("Interstício abaixo da orientação padrão CBJ.");
      if (to.ordinal - from.ordinal > 1) guidance.push("Salto: a data conhecida não comprova permanência na graduação imediatamente anterior ao destino.");
    }
  }
  guidance.push("CBJ 2023 p.9 §§7–9 prevê categorias e regimes especiais, não aferidos pelo Casca. Exceções podem ser registradas com justificativa. Registro de graduação concedida, sem exame, homologação ou certificação.");
  return { wasSkip: to.ordinal - from.ordinal > 1, exceptions, guidance };
}
