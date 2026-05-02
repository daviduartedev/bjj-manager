import type { MonthBillingIndicator } from "@/lib/billing/month-billing-indicator";
import type { PlanKind } from "@/lib/students/plan-kind";

/** Valor interno do selector na lista, inclui `all`. */
export type MensalidadesClientFilterKey = "all" | MonthBillingIndicator;

const QUERY_TO_FILTER: Record<string, MensalidadesClientFilterKey> = {
  todos: "all",
  pago: "paid",
  pendente: "pending",
  atrasado: "overdue",
  bolsista: "scholarship",
  outro: "other",
};

const FILTER_TO_QUERY: Record<MensalidadesClientFilterKey, string | null> = {
  all: null,
  paid: "pago",
  pending: "pendente",
  overdue: "atrasado",
  scholarship: "bolsista",
  other: "outro",
};

/**
 * Filtro por plano comercial do vínculo aberto na lista `/mensalidades`, query `tipo`.
 * `kids_either` aceita URLs legadas (`tipo=kids`, `infantil`) — Kids 1 ou Kids 2.
 */
export type MensalidadesPlanFilterKey = "all" | PlanKind | "kids_either";

/** @deprecated Use `MensalidadesPlanFilterKey`. */
export type MensalidadesKindFilterKey = MensalidadesPlanFilterKey;

const QUERY_TO_PLAN: Record<string, MensalidadesPlanFilterKey> = {
  todos: "all",
  adulto: "adult",
  adultos: "adult",
  adult: "adult",
  kids_1: "kids_1",
  kids1: "kids_1",
  "kids-1": "kids_1",
  kids_2: "kids_2",
  kids2: "kids_2",
  "kids-2": "kids_2",
  kids: "kids_either",
  infantil: "kids_either",
};

/**
 * **BUI-2.6**, parse do query param `filtro` (pt-BR).
 */
export function parseMensalidadesFiltroQuery(
  raw: string | string[] | undefined,
): MensalidadesClientFilterKey {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (typeof s !== "string") return "all";
  const k = s.trim().toLowerCase();
  return QUERY_TO_FILTER[k] ?? "all";
}

/** Parse do query param `tipo` (plano comercial + tokens legados `kids` / `infantil`). */
export function parseMensalidadesPlanQuery(
  raw: string | string[] | undefined,
): MensalidadesPlanFilterKey {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (typeof s !== "string") return "all";
  const k = s.trim().toLowerCase();
  return QUERY_TO_PLAN[k] ?? "all";
}

/** @deprecated Use `parseMensalidadesPlanQuery`. */
export const parseMensalidadesKindQuery = parseMensalidadesPlanQuery;

/**
 * Query string para `/mensalidades` com `mes`, `filtro` e `tipo` coerentes (partilhável).
 */
export function buildMensalidadesListSearchParams(opts: {
  mes?: string | null;
  filtro?: MensalidadesClientFilterKey;
  tipo?: MensalidadesPlanFilterKey;
}): string {
  const p = new URLSearchParams();
  const mesRaw = opts.mes?.trim();
  if (mesRaw) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(mesRaw)) p.set("mes", mesRaw);
    else if (/^\d{4}-\d{2}$/.test(mesRaw)) p.set("mes", `${mesRaw}-01`);
  }
  const filtro = opts.filtro ?? "all";
  const fq = FILTER_TO_QUERY[filtro];
  if (fq) p.set("filtro", fq);
  const tipo = opts.tipo ?? "all";
  if (tipo === "adult") p.set("tipo", "adulto");
  else if (tipo === "kids_1") p.set("tipo", "kids_1");
  else if (tipo === "kids_2") p.set("tipo", "kids_2");
  else if (tipo === "kids_either") p.set("tipo", "kids");
  const s = p.toString();
  return s ? `?${s}` : "";
}
