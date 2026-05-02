import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";
import { readIdorContext } from "./helpers/idor-context";
import { assertNoSensitiveLeaks } from "./helpers/leaks";

test.describe("IDOR entre contas", () => {
  test("utilizador A não vê perfil do aluno RLS-V-B", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    const { studentIdB, reason } = readIdorContext();

    test.skip(!email || !password, "Credenciais E2E ausentes");
    test.skip(!studentIdB, `Sem UUID do aluno B (${reason ?? "unknown"})`);

    await loginAs(page, email!, password!);

    await page.goto(`/alunos/${studentIdB}`, { waitUntil: "networkidle" });
    const html = await page.content();
    assertNoSensitiveLeaks(html);
    expect(html).not.toContain("RLS-V-B");

    await page.goto(`/mensalidades/${studentIdB}`, { waitUntil: "networkidle" });
    const htmlFin = await page.content();
    assertNoSensitiveLeaks(htmlFin);
    expect(htmlFin).not.toContain("RLS-V-B");
  });
});
