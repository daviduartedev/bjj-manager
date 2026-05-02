import { test, expect } from "./fixtures";

import { assertNoSensitiveLeaks } from "./helpers/leaks";

test.describe("Entradas inválidas e falhas seguras", () => {
  test("login com senha errada não vaza segredos", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    test.skip(!email, "E2E_USER_A_EMAIL ausente");

    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("E-mail").fill(email!);
    await page.getByLabel("Senha").fill("__wrong_password_for_security_test__");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await expect(
      page.getByText(/incorretos|Não foi possível entrar|Muitas tentativas/i).first(),
    ).toBeVisible({ timeout: 15_000 });
    const html = await page.content();
    assertNoSensitiveLeaks(html);
  });

  test("email inválido mantém validação no cliente", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("not-an-email");
    await page.getByLabel("Senha").fill("x");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(/e-mail|inválido/i).first()).toBeVisible({
      timeout: 5000,
    });
    assertNoSensitiveLeaks(await page.content());
  });
});
