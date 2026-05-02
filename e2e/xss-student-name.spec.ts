import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";

const XSS_PAYLOAD = '<img src=x onerror="window.__xss_fired=1">';

test.describe("XSS armazenado (nome do aluno)", () => {
  test("payload no nome não dispara alert nem scripts ao registar", async ({
    page,
  }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes");

    let dialogSeen = false;
    page.on("dialog", async () => {
      dialogSeen = true;
    });

    await loginAs(page, email!, password!);
    await page.goto("/alunos/novo", { waitUntil: "networkidle" });

    await page.getByLabel("Nome completo").fill(XSS_PAYLOAD);
    await page.getByRole("button", { name: "Registar aluno" }).click();

    await page.waitForTimeout(2500);

    const fired = await page.evaluate(() => (window as unknown as { __xss_fired?: number }).__xss_fired);
    expect(fired).toBeUndefined();
    expect(dialogSeen).toBe(false);
  });
});
