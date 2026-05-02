import { test, expect } from "./fixtures";

import { assertNoSensitiveLeaks } from "./helpers/leaks";

const PRIVATE_PATHS = [
  "/painel",
  "/alunos",
  "/alunos/novo",
  "/mensalidades",
  "/configuracoes",
  "/perfil",
];

test.describe("Rotas privadas sem sessão", () => {
  test("redirect HTTP para login (sem seguir redirect)", async ({ request, baseURL }) => {
    const origin = baseURL ?? "http://127.0.0.1:3000";
    for (const path of PRIVATE_PATHS) {
      const res = await request.get(`${origin}${path}`, { maxRedirects: 0 });
      expect(
        [302, 303, 307, 308],
        `Esperado redirect para ${path}, obtido ${res.status()}`,
      ).toContain(res.status());
      const loc = res.headers().location ?? "";
      expect(loc).toMatch(/\/login/i);
      const body = await res.text();
      assertNoSensitiveLeaks(body);
    }
  });

  test("UI: visitante acaba em /login sem dados operacionais na página", async ({
    page,
  }) => {
    for (const path of PRIVATE_PATHS) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page).toHaveURL(/\/login$/);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/RLS-V-[AB]/);
      assertNoSensitiveLeaks(await page.content());
    }
  });

  test("cookie inválido não abre área operacional", async ({ page, baseURL }) => {
    const origin = baseURL ?? "http://127.0.0.1:3000";
    await page.context().addCookies([
      {
        name: "sb-invalid-session",
        value: "not-a-jwt",
        url: origin,
      },
    ]);
    await page.goto("/painel", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login$/);
  });
});
