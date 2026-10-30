import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";

test.describe("Smoke UI rápido", () => {
  test("landing: abertura apresenta a academia e oferece cadastro e demonstração", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Sua academia organizada para dar o próximo passo.",
    );
    await expect(page.getByText("Muay Thai, Boxe, Jiu-Jítsu e Judô.", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Organizar minha academia", exact: true }).first()).toHaveAttribute("href", "/register");
    await page.getByRole("link", { name: "Conhecer o Casca", exact: true }).click();
    await expect(page).toHaveURL(/#sistema$/);
    await expect(page.getByLabel("O sistema em uso")).toBeInViewport();
    await expect(page.getByTestId("lp-fist-bump")).toBeVisible();
  });

  test("landing: demonstra tarefas reais sem prometer cobrança dos alunos", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#funcionalidades", { waitUntil: "domcontentloaded" });
    const rotina = page.getByRole("region", { name: "A rotina da academia, no seu lugar" });
    await expect(rotina.getByRole("heading", { name: "Chegou aluno novo? Pode deixar organizado." })).toBeVisible();
    await expect(rotina.getByRole("heading", { name: "O treino começa com a turma em dia." })).toBeVisible();
    await expect(rotina.getByRole("heading", { name: "Recebeu? Registre. Precisou? Confira." })).toBeVisible();
    await expect(rotina.getByText("Você recebe na academia e confirma o pagamento no Casca.", { exact: true })).toBeVisible();
    await expect(rotina.getByRole("heading", { name: "Abra o dia sabendo por onde começar." })).toBeVisible();
    await expect(rotina.getByRole("link", { name: "Organizar minha academia" })).toHaveAttribute("href", "/register");
  });

  test("landing: primeiros passos continuam legíveis no celular com movimento reduzido", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#como-funciona", { waitUntil: "domcontentloaded" });
    const jornada = page.getByRole("region", { name: "Seu próximo passo começa por aqui" });
    await expect(jornada.getByRole("heading", { name: "Cadastre quem treina com você." })).toBeVisible();
    await expect(jornada.getByRole("heading", { name: "Dê um lugar para cada tarefa." })).toBeVisible();
    await expect(jornada.getByRole("heading", { name: "Acompanhe. Ajuste. Siga em frente." })).toBeVisible();
    await expect(jornada.getByRole("link", { name: "Organizar minha academia" })).toHaveAttribute("href", "/register");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
