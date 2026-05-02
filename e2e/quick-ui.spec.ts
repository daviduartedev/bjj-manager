import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";

test.describe("Smoke UI rápido", () => {
  test("landing: secção funcionalidades e CTA com logo Casca", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const funcionalidades = page.locator("#funcionalidades");
    await expect(funcionalidades).toBeVisible();
    await expect(funcionalidades.getByText("O que você faz dentro do Casca")).toBeVisible();

    const ctaHeading = page.getByRole("heading", {
      name: /Feito para quem ensina e para quem administra a escola/i,
    });
    await expect(ctaHeading).toBeVisible();

    await expect(page.getByTestId("landing-cta-logo")).toBeVisible();
  });

  test("alunos: filtro Plano lista Adulto, Kids 1 e Kids 2", async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes (E2E_USER_A_EMAIL / E2E_USER_A_PASSWORD)");

    await loginAs(page, email!, password!);
    await page.goto("/alunos", { waitUntil: "networkidle" });

    const planRow = page.locator("span.type-field-label", { hasText: /^Plano$/ }).locator("..");
    await planRow.getByRole("combobox").click();

    await expect(page.getByRole("option", { name: "Todos" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Adulto" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Kids 1" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Kids 2" })).toBeVisible();

    await page.keyboard.press("Escape");
  });
});
