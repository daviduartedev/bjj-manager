import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { requireAcademyWriteAccess } from "./guards";

function database(response: { status: number; body: unknown }) {
  return createClient("https://database.test", "synthetic-test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async () => new Response(JSON.stringify(response.body), { status: response.status, headers: { "Content-Type": "application/json" } }) },
  });
}

describe("protecao publica de escrita da academia", () => {
  it("preserva clientes existentes antes de instalar a migration comercial", async () => {
    const result = await requireAcademyWriteAccess(database({ status: 404, body: { code: "PGRST205", message: "table unavailable" } }), "academy-a");
    expect(result).toEqual({ ok: true });
  });

  it("recusa a escrita quando a verificacao do banco falha", async () => {
    const result = await requireAcademyWriteAccess(database({ status: 500, body: { code: "XX000", message: "unavailable" } }), "academy-a");
    expect(result).toMatchObject({ ok: false });
  });

  it("nao confunde singleton ausente com ativacao desligada", async () => {
    expect(await requireAcademyWriteAccess(database({ status: 200, body: null }), "academy-a")).toMatchObject({ ok: false });
  });

  it("recusa conta sem contrato quando o controle comercial esta ativado", async () => {
    const client = createClient("https://database.test", "synthetic-test-key", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: async (url) => new Response(JSON.stringify(String(url).includes("casca_billing_settings") ? { enforcement_enabled: true } : null), { status: 200, headers: { "Content-Type": "application/json" } }) },
    });
    expect(await requireAcademyWriteAccess(client, "academy-a")).toMatchObject({ ok: false, error: expect.stringContaining("somente leitura") });
  });
});
