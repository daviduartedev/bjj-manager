import { z } from "zod";

import type { PlanKind } from "@/lib/students/plan-kind";
import {
  parseAlunosListColumns,
  stringifyAlunosListColumns,
  type AlunosListColumn,
} from "@/lib/students/alunos-list-columns";
import type { ListSortKey } from "@/lib/validations/students";
import { listSortSchema } from "@/lib/validations/students";

/** Filtro por `plan_kind` do vínculo aberto; `all` = sem filtro de plano. */
export type AlunosPlanFilter = "all" | PlanKind;

export type StudentListLifecycle =
  /** Carteira pré-definida: sem arquivo nem remoção (**STU-10**, **STU-11**). */
  | "principal"
  | "arquivados"
  | "removidos";

export type AlunosUrlState = {
  q: string;
  plan: AlunosPlanFilter;
  status: "all" | "active" | "inactive" | "paused";
  /** Separador Ciclo‑vida além da situação `status`. */
  lista: StudentListLifecycle;
  sort: ListSortKey;
  page: number;
  /** Colunas opcionais visíveis na tabela/cartões (nome e acções são fixos). */
  colunas: AlunosListColumn[];
};

export type { AlunosListColumn };

const urlSchema = z.object({
  q: z.string().optional(),
  plan: z.enum(["all", "adult", "kids_1", "kids_2"]).catch("all"),
  status: z
    .enum(["all", "active", "inactive", "paused"])
    .catch("all"),
  lista: z.enum(["principal", "arquivados", "removidos"]).catch("principal"),
  sort: listSortSchema.catch("name"),
});

export function parseAlunosSearchParams(
  raw: Record<string, string | string[] | undefined>,
): AlunosUrlState {
  const single = (k: string) => {
    const v = raw[k];
    return typeof v === "string" ? v : undefined;
  };
  const pageRaw = single("page");
  let page = 1;
  if (pageRaw) {
    const n = Number.parseInt(pageRaw, 10);
    if (!Number.isNaN(n) && n >= 1) page = n;
  }

  const parsed = urlSchema.safeParse({
    q: single("q"),
    plan: single("plan"),
    status: single("status"),
    lista: single("lista"),
    sort: single("sort"),
  });
  const v = parsed.success ? parsed.data : urlSchema.parse({});
  return {
    q: v.q?.trim() ?? "",
    plan: v.plan,
    status: v.status,
    lista: v.lista,
    sort: v.sort,
    page,
    colunas: parseAlunosListColumns(single("colunas")),
  };
}

export function stringifyAlunosSearchParams(state: AlunosUrlState): string {
  const u = new URLSearchParams();
  if (state.q) u.set("q", state.q);
  if (state.plan !== "all") u.set("plan", state.plan);
  if (state.status !== "all") u.set("status", state.status);
  if (state.lista !== "principal") u.set("lista", state.lista);
  if (state.sort !== "name") u.set("sort", state.sort);
  if (state.page > 1) u.set("page", String(state.page));
  const colunas = stringifyAlunosListColumns(state.colunas);
  if (colunas) u.set("colunas", colunas);
  const s = u.toString();
  return s ? `?${s}` : "";
}
