import { z } from "zod";

import type { PlanKind } from "@/lib/students/plan-kind";
import type { ListSortKey } from "@/lib/validations/students";
import { listSortSchema } from "@/lib/validations/students";

/** Filtro por `plan_kind` do vínculo aberto; `all` = sem filtro de plano. */
export type AlunosPlanFilter = "all" | PlanKind;

export type AlunosUrlState = {
  q: string;
  plan: AlunosPlanFilter;
  status: "all" | "active" | "inactive" | "paused";
  sort: ListSortKey;
  page: number;
};

const urlSchema = z.object({
  q: z.string().optional(),
  plan: z.enum(["all", "adult", "kids_1", "kids_2"]).catch("all"),
  status: z
    .enum(["all", "active", "inactive", "paused"])
    .catch("all"),
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
    sort: single("sort"),
  });
  const v = parsed.success ? parsed.data : urlSchema.parse({});
  return {
    q: v.q?.trim() ?? "",
    plan: v.plan,
    status: v.status,
    sort: v.sort,
    page,
  };
}

export function stringifyAlunosSearchParams(state: AlunosUrlState): string {
  const u = new URLSearchParams();
  if (state.q) u.set("q", state.q);
  if (state.plan !== "all") u.set("plan", state.plan);
  if (state.status !== "all") u.set("status", state.status);
  if (state.sort !== "name") u.set("sort", state.sort);
  if (state.page > 1) u.set("page", String(state.page));
  const s = u.toString();
  return s ? `?${s}` : "";
}
