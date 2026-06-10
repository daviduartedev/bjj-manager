import {
  parseCalendarDate,
  toCalendarDateStringInAppTZ,
} from "@/lib/dates";

/** GRD-3.6 — data civil em São Paulo; passado e hoje permitidos. */
export function validateGraduatedAtNotFuture(ymd: string): string | null {
  const d = parseCalendarDate(ymd);
  if (!d) return "Data inválida.";
  const today = toCalendarDateStringInAppTZ(new Date());
  const day = toCalendarDateStringInAppTZ(d);
  if (day > today) return "A data da graduação não pode ser no futuro.";
  return null;
}

export function graduatedAtFromYmd(ymd: string): Date {
  const d = parseCalendarDate(ymd);
  if (!d) throw new Error("Data inválida.");
  return new Date(d.getTime());
}
