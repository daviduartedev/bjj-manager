import type { MonthBillingIndicator } from "@/lib/billing/month-billing-indicator";

/** Valor interno do selector na lista — inclui `all`. */
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

/** Filtro por faixa etária (aluno) na lista `/mensalidades` — query `tipo`. */
export type MensalidadesKindFilterKey = "all" | "adult" | "kids";

const QUERY_TO_KIND: Record<string, MensalidadesKindFilterKey> = {
  todos: "all",
  adulto: "adult",
  adultos: "adult",
  kids: "kids",
  infantil: "kids",
};

/**
 * **BUI-2.6** — parse do query param `filtro` (pt-BR).
 */
export function parseMensalidadesFiltroQuery(
  raw: string | string[] | undefined,
): MensalidadesClientFilterKey {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (typeof s !== "string") return "all";
  const k = s.trim().toLowerCase();
  return QUERY_TO_FILTER[k] ?? "all";
}

/** Parse do query param `tipo` (`todos` | `adulto` | `kids`, pt-BR). */
export function parseMensalidadesKindQuery(
  raw: string | string[] | undefined,
): MensalidadesKindFilterKey {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (typeof s !== "string") return "all";
  const k = s.trim().toLowerCase();
  return QUERY_TO_KIND[k] ?? "all";
}

/**
 * Query string para `/mensalidades` com `mes`, `filtro` e `tipo` coerentes (partilhável).
 */
export function buildMensalidadesListSearchParams(opts: {
  mes?: string | null;
  filtro?: MensalidadesClientFilterKey;
  tipo?: MensalidadesKindFilterKey;
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
  else if (tipo === "kids") p.set("tipo", "kids");
  const s = p.toString();
  return s ? `?${s}` : "";
}
