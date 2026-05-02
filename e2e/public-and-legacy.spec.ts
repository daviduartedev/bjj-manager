import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";
import { assertNoSensitiveLeaks } from "./helpers/leaks";

test.describe("Rotas públicas e legado", () => {
  test("landing / responde sem redirect forçado para login", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/$/);
    assertNoSensitiveLeaks(await page.content());
  });

  test("/login é acessível sem sessão", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("/register redirecciona anónimo para /login", async ({ page, request, baseURL }) => {
    const origin = baseURL ?? "http://127.0.0.1:3000";
    const res = await request.get(`${origin}/register`, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(res.status());
    expect(res.headers().location ?? "").toMatch(/\/login/i);

    await page.goto("/register", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login$/);
  });

  test("/dashboard redirecciona para /painel com sessão", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes");

    await loginAs(page, email!, password!);
    await page.goto("/dashboard", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/painel/);
  });

  test("sessão válida em /login vai para /painel", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes");

    await loginAs(page, email!, password!);
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/painel/);
  });
});
