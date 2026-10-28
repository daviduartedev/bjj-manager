import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const account = {
  id: "academy-from-profile", name: "Academia teste", slug: "academia-teste",
  storefront_whatsapp: null, storefront_published: false, modality: "jiu_jitsu",
  legal_name: null, cnpj: null, signature_url: null, logo_url: null,
  readiness_confirmed_at: null, readiness_kids_degree_months: null,
  created_at: "2026-01-01", updated_at: "2026-01-01",
};
const profile = {
  id: "profile", user_id: "session-user", account_id: account.id,
  display_name: "Professora", phone: null, role: "professor",
  created_at: "2026-01-01", updated_at: "2026-01-01", accounts: account,
};

/** Apenas a fronteira externa Supabase é substituída; a resolução pública é real. */
function respondWith(row: unknown, authenticated = true) {
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({
      data: { user: authenticated ? { id: "session-user", user_metadata: { modality: "boxing", role: "professor" } } : null },
      error: null,
    }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }) }),
      }),
    }),
  };
  // Fake limitado às operações externas usadas nesta jornada; o SDK completo não é necessário.
  vi.mocked(createClient).mockResolvedValue(client as unknown as Awaited<ReturnType<typeof createClient>>);
}

beforeEach(() => vi.resetAllMocks());

describe("getCurrentAccount", () => {
  it("retorna modalidade persistida da academia vinculada, ignorando modalidade de metadata", async () => {
    respondWith(profile);
    const result = await getCurrentAccount();
    expect(result?.account).toEqual(account);
    expect(result?.profile.role).toBe("professor");
  });

  it("não atribui Jiu-Jitsu ou privilégio quando modalidade ou papel são ilegíveis", async () => {
    for (const invalid of [
      { ...profile, accounts: { ...account, modality: null } },
      { ...profile, accounts: { ...account, modality: "invalid" } },
      { ...profile, role: "unknown" },
      { ...profile, role: null },
      { ...profile, accounts: null },
      null,
    ]) {
      respondWith(invalid);
      expect(await getCurrentAccount()).toBeNull();
    }
  });

  it("sem autenticação não devolve contexto de academia", async () => {
    respondWith(profile, false);
    expect(await getCurrentAccount()).toBeNull();
  });
});
