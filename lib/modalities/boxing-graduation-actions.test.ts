import { describe, expect, it, vi } from "vitest";
const { account, client } = vi.hoisted(() => ({ account: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentAccount: account }));
vi.mock("@/lib/supabase/server", () => ({ createClient: client }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { promoteStudent, addGraduation, updateGraduation, updateGraduationWeight } from "@/actions/graduations";
describe("operações diretas de graduação em Boxe", () => {
  it("recusa promover, incluir, editar e peso em graduação antes de consultar IDs de qualquer tenant", async () => {
    account.mockResolvedValue({ profile: { role: "professor" }, account: { modality: "boxing" } });
    for (const studentId of ["aluno-próprio", "aluno-de-outra-academia"]) {
      for (const operation of [promoteStudent, addGraduation, updateGraduation, updateGraduationWeight]) {
        expect(await operation(studentId, {})).toEqual({ ok: false, error: "Boxe não possui graduação." });
      }
    }
    expect(client).not.toHaveBeenCalled();
  });
});
