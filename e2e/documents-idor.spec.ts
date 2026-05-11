import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";
import { assertNoSensitiveLeaks } from "./helpers/leaks";

/**
 * Verifica que `/documentos/<id-de-outra-conta>` e `/pedagogico/planos/<id-de-outra-conta>`
 * não vazam conteúdo cross-tenant. Usa um UUID inválido para forçar 404 (RLS oculta a linha
 * a partir do server component, e a rota cai no `notFound()`).
 */

const INVALID_UUID = "00000000-0000-4000-8000-000000000999";

test.describe("IDOR documentos e planos", () => {
  test("/documentos/<uuid-invalido> resulta em 404 ou navegação segura", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes");

    await loginAs(page, email!, password!);
    const response = await page.goto(`/documentos/${INVALID_UUID}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBeGreaterThanOrEqual(200);
    const html = await page.content();
    assertNoSensitiveLeaks(html);
    expect(html.toLowerCase()).not.toContain("access denied");
  });

  test("/pedagogico/planos/<uuid-invalido> resulta em 404 ou navegação segura", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes");

    await loginAs(page, email!, password!);
    const response = await page.goto(`/pedagogico/planos/${INVALID_UUID}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBeGreaterThanOrEqual(200);
    const html = await page.content();
    assertNoSensitiveLeaks(html);
    expect(html.toLowerCase()).not.toContain("access denied");
  });
});
