import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  modality: "boxing", role: "professor", rows: {} as Record<string, Record<string, unknown>[]>,
}));
const accountId = "10000000-0000-4000-8000-000000000001";
const instructorId = "20000000-0000-4000-8000-000000000001";
vi.mock("@/lib/auth", () => ({ getCurrentAccount: async () => ({
  account: { id: accountId, modality: state.modality }, profile: { id: instructorId, account_id: accountId, role: state.role },
}) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
// Adaptador na fronteira Supabase; o script SQL separado prova constraints e RLS reais.
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from(table: string) {
  let operation = "read"; let value: Record<string, unknown> = {}; const filters: [string, unknown][] = [];
  const execute = () => {
    const rows = state.rows[table] ?? [];
    if (operation === "insert") {
      const row = { ...value, id: "30000000-0000-4000-8000-000000000001" };
      (state.rows[table] ??= []).push(row); return { data: row, error: null };
    }
    const row = rows.find(r => filters.every(([k, v]) => r[k] === v));
    if (operation === "update" && row) Object.assign(row, value);
    return { data: row ?? null, error: null };
  };
  const query = { select: () => query, eq: (k: string, v: unknown) => { filters.push([k,v]); return query; },
    insert: (v: Record<string,unknown>) => { operation = "insert"; value = v; return query; },
    update: (v: Record<string,unknown>) => { operation = "update"; value = v; return query; },
    single: async () => execute(), maybeSingle: async () => execute(), then: (resolve: (v:unknown) => unknown) => Promise.resolve(execute()).then(resolve),
  }; return query;
} }) }));
import { createClass, updateClass } from "@/actions/classes";

beforeEach(() => {
  state.modality = "boxing"; state.role = "professor";
  state.rows = { profiles: [{ id: instructorId, account_id: accountId, role: "professor" }], casca_billing_settings: [{ id: true, enforcement_enabled: false }] };
});
describe("turmas na modalidade da sessão", () => {
  it("persiste Boxe separadamente do público Adulto", async () => {
    expect(await createClass({ name: "Boxe noite", kind: "adult", modality: "boxing", instructorProfileId: instructorId })).toMatchObject({ ok: true });
    expect(state.rows.classes[0]).toMatchObject({ account_id: accountId, modality: "boxing", kind: "adult" });
  });
  it.each(["jiu_jitsu", "boxing", "judo", "muay_thai"])("cria e edita turma de %s pela operação pública", async modality => {
    state.modality = modality;
    const input = { name: "Turma noite", kind: "adult", modality, instructorProfileId: instructorId };
    const created = await createClass(input);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(await updateClass({ ...input, classId: created.id, name: "Turma manhã" })).toEqual({ ok: true });
    expect(state.rows.classes[0]).toMatchObject({ modality, kind: "adult", name: "Turma manhã" });
  });
  it("recusa modalidade forjada, público novo não adulto, aluno instrutor e instrutor de outra academia", async () => {
    const input = { name: "Boxe", kind: "adult", modality: "boxing", instructorProfileId: instructorId };
    expect((await createClass({ ...input, modality: "judo" })).ok).toBe(false);
    expect((await createClass({ ...input, kind: "kids" })).ok).toBe(false);
    state.rows.profiles[0].role = "student";
    expect((await createClass(input)).ok).toBe(false);
    state.rows.profiles[0].role = "professor"; state.rows.profiles[0].account_id = "tenant-b";
    expect((await createClass(input)).ok).toBe(false);
    expect(state.rows.classes).toBeUndefined();
  });
  it("recusa operação de aluno e não confirma edição fora do tenant", async () => {
    const input = { name: "Boxe", kind: "adult", modality: "boxing", instructorProfileId: instructorId };
    state.role = "student";
    expect((await createClass(input)).ok).toBe(false);
    state.role = "professor";
    state.rows.classes = [{ id: "30000000-0000-4000-8000-000000000001", account_id: "tenant-b", name: "Estrangeira" }];
    expect((await updateClass({ ...input, classId: state.rows.classes[0].id })).ok).toBe(false);
    expect(state.rows.classes[0].name).toBe("Estrangeira");
  });
});
