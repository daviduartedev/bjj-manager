import { beforeEach, describe, expect, it, vi } from "vitest";
const session = vi.hoisted(() => ({ modality: "judo", role: "professor" }));
const storage = vi.hoisted(() => ({ students: [] as Record<string, unknown>[] }));
vi.mock("@/lib/auth", () => ({ getCurrentAccount: async () => ({ account: { id: "tenant-a", modality: session.modality }, profile: { role: session.role } }) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
// Adapter da fronteira Supabase. Invariantes/RLS são provadas no Postgres real pelo script.
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from(table: string) {
  let operation = "read"; let value: Record<string, unknown> = {}; const filters: [string, unknown][] = [];
  const execute = () => {
    if (table !== "students") return { data: [], error: null };
    if (operation === "insert") { const row = { ...value, id: "student-a" }; storage.students.push(row); return { data: row, error: null }; }
    const row = storage.students.find(r => filters.every(([k,v]) => r[k] === v));
    if (operation === "update" && row) Object.assign(row, value);
    return { data: row ?? null, error: null };
  };
  const query = { select: () => query, order: () => query, eq: (k:string,v:unknown) => { filters.push([k,v]); return query; },
    insert: (v:Record<string,unknown>) => { operation="insert"; value=v; return query; },
    update: (v:Record<string,unknown>) => { operation="update"; value=v; return query; },
    single: async () => execute(), maybeSingle: async () => execute(), then: (resolve: (v:unknown) => unknown) => Promise.resolve(execute()).then(resolve),
  }; return query;
} }) }));
import { createStudent, updateStudent, quickUpdateStudent } from "@/actions/students";
const input = { full_name: "Judoca graduada", kind: "adult", birth_date: "2000-01-01", academy_start_date: "2026-10-22", is_exempt: true,
  graduation_reference_id: "cbj-2023", current_rank_code: "dan-10", current_rank_date: null, weight_kg: 72.5 };
beforeEach(() => { storage.students=[]; session.role="professor"; });
describe("cadastro e edição públicos de Judô", () => {
  it("registra diretamente dan superior sem data inventada e mantém graduação nas edições", async () => {
    expect(await createStudent(input)).toEqual({ ok: true });
    expect(storage.students[0]).toMatchObject({ full_name: "Judoca graduada", graduation_reference_id: "cbj-2023", current_rank_code: "dan-10", current_rank_date: null, current_belt_id: null, current_degree: null, weight_kg: 72.5 });
    expect(storage.students[0]).not.toHaveProperty("role");
    expect(await updateStudent("student-a", { ...input, full_name: "Judoca editada", current_rank_date: "2025-04-05" })).toEqual({ ok: true });
    expect(await quickUpdateStudent("student-a", "kids", { status: "paused", is_exempt: true, graduation_reference_id: "cbj-2023", current_rank_code: "dan-10", current_rank_date: null })).toEqual({ ok: true });
    expect(storage.students[0]).toMatchObject({ full_name: "Judoca editada", status: "paused", current_rank_date: null, current_rank_code: "dan-10" });
  });
  it("não admite aluno a operar nem referência estrangeira pela action", async () => {
    session.role="student";
    expect((await createStudent(input)).ok).toBe(false);
    session.role="professor";
    expect((await createStudent({ ...input, graduation_reference_id: "cbmtt-19-khan" })).ok).toBe(false);
    expect(storage.students).toEqual([]);
  });
});
