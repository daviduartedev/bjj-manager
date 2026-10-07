import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";

test.describe("peso no cadastro", () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_USER_A_EMAIL;
    const password = process.env.E2E_USER_A_PASSWORD;
    test.skip(!email || !password, "Credenciais E2E ausentes (E2E_USER_A_EMAIL / E2E_USER_A_PASSWORD)");
    await loginAs(page, email!, password!);
  });

  test("baby segue com peso abaixo de 20 kg", async ({ page }) => {
    await page.goto("/alunos/novo");
    await page.getByLabel("Nome completo").fill(`E2E Baby peso ${Date.now()}`);
    await page.getByLabel("Data de nascimento").fill("2022-06-01");
    await page.getByRole("combobox", { name: "Tipo" }).click();
    await page.getByRole("option", { name: "Baby (3–5 anos)" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();

    const weight = page.getByLabel("Peso (kg) — opcional");
    await expect(weight).toBeVisible();
    await expect(page.getByText("Qualquer peso em kg")).toBeVisible();
    await weight.fill("12.4");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByRole("combobox", { name: "Plano" })).toBeVisible();
    await expect(page.getByText("Mínimo 20,0 kg.")).toHaveCount(0);
  });

  test("baby não segue com peso zero", async ({ page }) => {
    await page.goto("/alunos/novo");
    await page.getByLabel("Nome completo").fill(`E2E Baby zero ${Date.now()}`);
    await page.getByLabel("Data de nascimento").fill("2022-06-01");
    await page.getByRole("combobox", { name: "Tipo" }).click();
    await page.getByRole("option", { name: "Baby (3–5 anos)" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByLabel("Peso (kg) — opcional").fill("0");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByText("Indique o peso em kg.")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Plano" })).toHaveCount(0);
  });

  test("adulto no cadastro não mostra o campo de peso", async ({ page }) => {
    await page.goto("/alunos/novo");
    await page.getByLabel("Nome completo").fill(`E2E Adulto ${Date.now()}`);
    await page.getByLabel("Data de nascimento").fill("1990-04-02");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByLabel(/Ano de entrada na academia/)).toBeVisible();
    await expect(page.getByLabel("Peso (kg) — opcional")).toHaveCount(0);
  });
});
