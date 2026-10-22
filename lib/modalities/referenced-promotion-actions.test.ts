import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { account, client, rpc } = vi.hoisted(() => ({ account: vi.fn(), client: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentAccount: account }));
vi.mock("@/lib/supabase/server", () => ({ createClient: client }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { promoteReferencedStudent } from "@/actions/referenced-promotions";
const id = "00000000-0000-4000-8000-000000000001";
describe("operação pública de promoção referenciada", () => {
  beforeEach(() => { vi.clearAllMocks(); client.mockResolvedValue({ rpc }); });
  afterEach(() => { vi.useRealTimers(); });
  it("recusa papel ausente/aluno e esporte diferente antes de consultar IDs", async () => {
    for (const context of [null, { profile: { role: "student" }, account: { modality: "judo" } }, { profile: {}, account: { modality: "judo" } }, { profile: { role: "professor" }, account: { modality: "muay_thai" } }]) {
      account.mockResolvedValue(context);
      expect((await promoteReferencedStudent(id, {})).ok).toBe(false);
    }
    expect(client).not.toHaveBeenCalled();
  });
  it("envia somente graduação/data/motivo à operação atômica, sem aceitar tenant", async () => {
    account.mockResolvedValue({ profile: { role: "professor" }, account: { modality: "judo" } });
    const input = { reference_id: "cbj-2023", rank_code: "kyu-11", granted_on: "2026-01-01", reason: "" };
    expect((await promoteReferencedStudent(id, { ...input, account_id: "forged" })).ok).toBe(false);
    rpc.mockResolvedValue({ data: id, error: null });
    expect(await promoteReferencedStudent(id, input)).toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("promote_referenced_student", { p_student_id: id, p_reference_id: "cbj-2023", p_rank_code: "kyu-11", p_granted_on: "2026-01-01", p_reason: null });
  });
  it("usa dia civil de São Paulo durante a virada UTC e recusa data impossível", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T01:00:00Z"));
    account.mockResolvedValue({ profile: { role: "professor" }, account: { modality: "judo" } });
    rpc.mockResolvedValue({ data: id, error: null });
    const input = { reference_id: "cbj-2023", rank_code: "kyu-11", reason: "" };
    expect((await promoteReferencedStudent(id, { ...input, granted_on: "2026-10-23" })).ok).toBe(false);
    expect((await promoteReferencedStudent(id, { ...input, granted_on: "2026-02-30" })).ok).toBe(false);
    expect((await promoteReferencedStudent(id, { ...input, granted_on: "2026-10-22" })).ok).toBe(true);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
