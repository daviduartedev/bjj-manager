import { test, expect } from "./fixtures";

import { loginAs } from "./helpers/auth";

test.describe("Smoke UI rápido", () => {
  test("landing: hero restaurada mantém apenas o CTA de cadastro", async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "A plataforma brasileira para gestão de academias de artes marciais.",
    );
    await expect(page.getByText("Cada modalidade com sua história. Sua academia com tudo organizado.", { exact: false })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Organizar minha academia", exact: true }).first()).toHaveAttribute("href", "/register");
    await expect(page.getByRole("link", { name: "Conhecer o Casca", exact: true })).toHaveCount(0);
    await expect(page.getByText("Um olhar por dentro do Casca. Demonstração com dados de exemplo.", { exact: true })).toHaveCount(0);
    await page.getByLabel("O sistema em uso").scrollIntoViewIfNeeded();
    await expect(page.getByLabel("O sistema em uso")).toBeInViewport();
    await expect(page.getByTestId("lp-fist-bump")).toBeVisible();
    expect(browserErrors).toEqual([]);
  });

  test("landing: demonstra tarefas reais sem prometer cobrança dos alunos", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#funcionalidades", { waitUntil: "domcontentloaded" });
    const rotina = page.getByRole("region", { name: "A rotina da academia, no seu lugar" });
    for (const tarefa of [
      "Chegou aluno novo? Pode deixar organizado.",
      "O treino começa com a turma em dia.",
      "Recebeu? Registre. Precisou? Confira.",
      "Abra o dia sabendo por onde começar.",
    ]) {
      await expect(rotina.getByRole("heading", { name: tarefa })).toBeVisible();
    }
    await expect(rotina.getByText("Você recebe na academia e confirma o pagamento no Casca.")).toBeVisible();
    await expect(rotina.getByRole("button")).toHaveCount(0);
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
    await expect(jornada.getByText("O que pede atenção hoje", { exact: true })).toBeVisible();
    await expect(jornada.getByRole("link", { name: "Organizar minha academia" })).toHaveAttribute("href", "/register");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("landing: oferta esclarece modalidades e mantém a escolha do plano", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#planos", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Um plano para o tamanho da sua academia." })).toBeVisible();
    await expect(page.getByText("Recomendado", { exact: true })).toBeVisible();
    await expect(page.getByText("O mais escolhido", { exact: true })).toHaveCount(0);
    await page.getByText("No Boxe também dá para usar?", { exact: true }).click();
    await expect(page.getByText("Sim. No Boxe, você acompanha alunos, aulas, presenças e mensalidades, sem precisar cadastrar faixa ou grau.", { exact: true })).toBeVisible();
    await page.getByText("O Casca recebe as mensalidades dos meus alunos?", { exact: true }).click();
    await expect(page.getByText("A academia continua recebendo dos alunos. Você acompanha os vencimentos e confirma no Casca quando o pagamento acontece.", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Escolher Academia", exact: true }).click();
    await expect(page).toHaveURL(/\/register\?plano=academia$/, { timeout: 30_000 });
  });

  test("landing: menu móvel funciona por teclado e fecha ao navegar", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const abrirMenu = page.getByRole("button", { name: "Abrir menu" });
    await abrirMenu.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("navigation", { name: "Menu da página" });
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(abrirMenu).toBeFocused();
    await page.keyboard.press("Enter");
    await menu.getByRole("link", { name: "Como funciona" }).click();
    await expect(page).toHaveURL(/#como-funciona$/);
    await expect(menu).toBeHidden();
    await expect(page.getByRole("heading", { name: "Seu próximo passo começa por aqui." })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("landing: manifesto cita mestres e lutadores de várias modalidades", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#manifesto", { waitUntil: "domcontentloaded" });
    const manifesto = page.getByRole("region", { name: "Manifesto do Casca" });
    await expect(manifesto.getByText("Por que existimos", { exact: true })).toHaveCount(0);
    await expect(manifesto).toBeVisible();
    for (const nome of ["Jigoro Kano", "Rillion Gracie", "Anderson Silva", "Éder Jofre", "Natália Falavigna"]) {
      await expect(manifesto.getByText(nome, { exact: true })).toBeVisible();
    }
    await expect(manifesto).toContainText("O Casca existe para que a sua continue abrindo");
  });

  test("landing: tarja alterna modalidades sem controles e respeita movimento reduzido", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const tarja = page.getByRole("region", { name: "O Casca nasceu para ajudar sua academia" });
    await tarja.scrollIntoViewIfNeeded();
    const modalidade = tarja.getByTestId("landing-current-modality");
    await expect(modalidade).toBeVisible();
    const primeira = await modalidade.innerText();
    await expect(modalidade).not.toHaveText(primeira, { timeout: 6_000 });
    await expect(tarja.getByRole("button")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(tarja.getByText("Judô, Jiu-Jitsu, Muay Thai e Boxe", { exact: true })).toBeVisible();
    await expect(tarja.getByRole("button")).toHaveCount(0);
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
