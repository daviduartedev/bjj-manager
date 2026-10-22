import { formatDateBR } from "@/lib/dates/format-br";
import { timeAtCurrentBelt } from "@/lib/dates/duration-domain";
import { findReferencedRank, type ReferencedGraduationFields } from "./referenced-ranks";

/** O chamador não fornece entrada na academia: ela nunca pode substituir a data esportiva. */
export function referencedGraduationSummary(fields: ReferencedGraduationFields, todayYmd: string) {
  return {
    rank: findReferencedRank(fields.graduation_reference_id, fields.current_rank_code),
    dateLabel: formatDateBR(fields.current_rank_date) ?? "Data não informada",
    durationLabel: timeAtCurrentBelt(fields.current_rank_date, todayYmd) ?? "Tempo indisponível",
  };
}
