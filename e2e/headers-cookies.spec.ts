import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";

test.describe("Cabeçalhos e cookies de sessão", () => {
  test("baseline: página pública responde", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
  });

  test("cabeçalhos de segurança globais (SECE2E-1.5)", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]?.toLowerCase()).toBe("sameorigin");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toBeTruthy();
    expect(h["x-dns-prefetch-control"]).toBe("off");
  });

  test("cookies Supabase após login usam flags sensatas", async ({ page, context }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes");

    await loginAs(page, email!, password!);
    const cookies = await context.cookies();
    const authCookies = cookies.filter((c) => c.name.startsWith("sb-"));
    expect(authCookies.length).toBeGreaterThan(0);
    const httpOnlyAuth = authCookies.filter((c) => c.httpOnly);
    expect(httpOnlyAuth.length).toBeGreaterThan(0);
    for (const c of httpOnlyAuth) {
      if (c.sameSite) {
        expect(["Lax", "Strict", "None"]).toContain(c.sameSite);
      }
    }
  });
});
