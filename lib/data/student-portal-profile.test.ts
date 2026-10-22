import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ role: "student", modality: "boxing", rows: [] as Record<string,unknown>[] }));
vi.mock("@/lib/auth", () => ({ getCurrentAccount: async () => ({ user: { id: "self" }, profile: { role: state.role, account_id: "academy-a" }, account: { name: "Academia A", modality: state.modality } }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from() {
  const filters: [string, unknown][] = [];
  const q = { select: () => q, eq: (k: string, v: unknown) => { filters.push([k,v]); return q; }, is: (k: string, v: unknown) => { filters.push([k,v]); return q; },
    maybeSingle: async () => ({ data: state.rows.find(r => filters.every(([k,v]) => r[k] === v)) ?? null, error: null }) };
  return q;
} }) }));
import { getOwnStudentPortalProfile } from "./student-portal-profile";
beforeEach(() => {
  state.role = "student"; state.modality = "boxing";
  state.rows = [{ id: "own", user_id: "self", account_id: "academy-a", full_name: "Ficha própria", archived_at: null, removed_at: null, belts: null },
    { id: "peer", user_id: "peer", account_id: "academy-a", full_name: "Colega", archived_at: null, removed_at: null }];
});
it("lê somente a ficha ligada à sessão e informa modalidade da academia", async () => {
  expect(await getOwnStudentPortalProfile()).toMatchObject({ id: "own", full_name: "Ficha própria", modality: "boxing", currentBelt: null });
  state.rows[0].account_id = "academy-b";
  expect(await getOwnStudentPortalProfile()).toBeNull();
});
it("não oferece ficha de aluno ao professor nem a cadastro arquivado", async () => {
  state.role = "professor";
  expect(await getOwnStudentPortalProfile()).toBeNull();
  state.role = "student"; state.rows[0].archived_at = "2026-10-22";
  expect(await getOwnStudentPortalProfile()).toBeNull();
});
