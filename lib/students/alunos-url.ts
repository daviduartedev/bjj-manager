import { z } from "zod";

import type { ListSortKey } from "@/lib/validations/students";
import { listSortSchema } from "@/lib/validations/students";

export type AlunosUrlState = {
  q: string;
  kind: "all" | "adult" | "kids";
  status: "all" | "active" | "inactive" | "paused";
  sort: ListSortKey;
  page: number;
};

const urlSchema = z.object({
  q: z.string().optional(),
  kind: z.enum(["all", "adult", "kids"]).catch("all"),
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
    kind: single("kind"),
    status: single("status"),
    sort: single("sort"),
  });
  const v = parsed.success ? parsed.data : urlSchema.parse({});
  return {
    q: v.q?.trim() ?? "",
    kind: v.kind,
    status: v.status,
    sort: v.sort,
    page,
  };
}

export function stringifyAlunosSearchParams(state: AlunosUrlState): string {
  const u = new URLSearchParams();
  if (state.q) u.set("q", state.q);
  if (state.kind !== "all") u.set("kind", state.kind);
  if (state.status !== "all") u.set("status", state.status);
  if (state.sort !== "name") u.set("sort", state.sort);
  if (state.page > 1) u.set("page", String(state.page));
  const s = u.toString();
  return s ? `?${s}` : "";
}
