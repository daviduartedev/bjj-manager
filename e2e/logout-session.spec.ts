import { test, expect } from "./fixtures";

import { loginAs, logoutViaShell } from "./helpers/auth";
import { assertNoSensitiveLeaks } from "./helpers/leaks";

test.describe("Sessão e logout", () => {
  test("após logout não é possível ver /painel", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes");

    await loginAs(page, email!, password!);
    await logoutViaShell(page);

    await page.goto("/painel", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login$/);
    assertNoSensitiveLeaks(await page.content());
  });
});
