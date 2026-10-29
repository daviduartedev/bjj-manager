import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  role: "professor" as string | null,
  modality: "jiu_jitsu",
  error: null as { message: string } | null,
  calls: [] as unknown[],
}));

vi.mock("@/lib/auth", () => ({
  getCurrentAccount: async () =>
    state.role
      ? { account: { modality: state.modality }, profile: { role: state.role } }
      : null,
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => {
      const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: { enforcement_enabled: false }, error: null }) };
      return query;
    },
    rpc: async (name: string, args: unknown) => {
      state.calls.push({ name, args });
      return { error: state.error };
    },
  }),
}));

import { switchAcademyModality } from "@/actions/settings";

beforeEach(() => {
  state.role = "professor";
  state.modality = "jiu_jitsu";
  state.error = null;
  state.calls = [];
});

describe("troca de modalidade pela configuração", () => {
  it("chama a operação da academia vazia com o destino confirmado", async () => {
    expect(await switchAcademyModality("boxing")).toEqual({ ok: true });
    expect(state.calls).toEqual([{ name: "switch_academy_modality", args: { p_target: "boxing" } }]);
  });

  it("não chama a operação para aluno, sessão ausente ou destino igual", async () => {
    state.role = "student";
    expect(await switchAcademyModality("boxing")).toMatchObject({ ok: false });
    state.role = null;
    expect(await switchAcademyModality("boxing")).toMatchObject({ ok: false });
    state.role = "professor";
    expect(await switchAcademyModality("jiu_jitsu")).toMatchObject({ ok: false });
    expect(await switchAcademyModality("karate")).toMatchObject({ ok: false });
    expect(state.calls).toEqual([]);
  });

  it("traduz a academia ocupada sem tratar isso como sucesso", async () => {
    state.error = { message: "academy is not empty" };
    const result = await switchAcademyModality("judo");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("não foi alterada");
  });
});
