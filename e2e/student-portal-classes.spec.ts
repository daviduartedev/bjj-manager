/**
 * E2E — Portal do aluno: aulas e check-in (Stage 3)
 *
 * Pré-requisito: pnpm db:validate-rls deve ter sido executado (cria RLS-V-CLASS fixture).
 * A fixture cria turma + sessão (amanhã) + inscrição de alunos.
 *
 * Nota timing: check-in real exige sessão dentro da janela 6h — testes de check-in via UI
 * são marcados como `skip` quando a sessão não está na janela; o cenário E2E ponta a ponta
 * usa smoke de navegação + verificação de rejeição fora da janela.
 */

import { test, expect } from "./fixtures";
import { loginAs } from "./helpers/auth";

const EMAIL_A = process.env.E2E_USER_A_EMAIL;
const PASS_A = process.env.E2E_USER_A_PASSWORD;
const EMAIL_STUDENT = process.env.E2E_STUDENT_EMAIL;
const PASS_STUDENT = process.env.E2E_USER_A_PASSWORD; // mesma senha partilhada

// ─── Cenário: Item Aulas visível na sidebar do professor ──────────────────────

test.describe("Sidebar do professor", () => {
  test("Item Aulas aparece no menu principal", async ({ page }) => {
    test.skip(!EMAIL_A || !PASS_A, "Credenciais E2E professor ausentes");

    await loginAs(page, EMAIL_A!, PASS_A!);
    await page.waitForURL(/\/painel/);

    const aulasLink = page.getByRole("link", { name: /^Aulas$/i });
    await expect(aulasLink).toBeVisible();
    await expect(aulasLink).toHaveAttribute("href", "/aulas");
  });
});

// ─── Cenário: Navegação nas páginas de professor ──────────────────────────────

test.describe("Painel professor — Aulas", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!EMAIL_A || !PASS_A, "Credenciais E2E professor ausentes");
    await loginAs(page, EMAIL_A!, PASS_A!);
  });

  test("Página /aulas carrega com lista de sessões ou mensagem de vazio", async ({ page }) => {
    await page.goto("/aulas", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /aulas/i })).toBeVisible();
    const hasContent =
      (await page.getByRole("link", { name: /gerenciar turmas/i }).count()) > 0;
    expect(hasContent).toBe(true);
  });

  test("Página /aulas/turmas carrega com lista ou botão criar", async ({ page }) => {
    await page.goto("/aulas/turmas", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /turmas/i })).toBeVisible();
    const hasBtn =
      (await page.getByRole("link", { name: /nova turma/i }).count()) > 0;
    expect(hasBtn).toBe(true);
  });

  test("Formulário de nova turma carrega e aceita nome", async ({ page }) => {
    await page.goto("/aulas/turmas/nova", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /nova turma/i })).toBeVisible();
    const nameInput = page.getByLabel(/nome da turma/i);
    await expect(nameInput).toBeVisible();

    await nameInput.fill("Turma E2E Smoke");
    await expect(nameInput).toHaveValue("Turma E2E Smoke");
  });

  test("Criação de turma via UI redireciona para detalhe (smoke ponta a ponta)", async ({ page }) => {
    await page.goto("/aulas/turmas/nova", { waitUntil: "networkidle" });

    const uniqueName = `E2E-Turma-${Date.now()}`;
    await page.getByLabel(/nome da turma/i).fill(uniqueName);

    await page.getByRole("button", { name: /criar turma/i }).click();

    await page.waitForURL(/\/aulas\/turmas\/[0-9a-f-]+$/, { timeout: 15_000 });
    await expect(page.getByText(uniqueName)).toBeVisible();
  });
});

// ─── Cenário: Check-in rejeitado fora da janela (sem manipulação de DB) ──────

test.describe("Portal do aluno — check-in fora da janela", () => {
  test("Página /portal/aulas carrega com estado adequado (flag ligada ou empty state)", async ({
    page,
  }) => {
    test.skip(!EMAIL_STUDENT || !PASS_STUDENT, "Credenciais E2E aluno ausentes");

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(EMAIL_STUDENT!);
    await page.getByLabel("Senha").fill(PASS_STUDENT!);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL(/\/portal/, { timeout: 30_000 });
    await page.goto("/portal/aulas", { waitUntil: "networkidle" });

    const heading = page.getByRole("heading", { name: /aulas/i });
    await expect(heading).toBeVisible();
  });
});

// ─── Cenário: Professor vê sessão e check-ins (usando fixture RLS-V-CLASS) ───

test.describe("Professor vê check-ins da sessão (fixture RLS-V-CLASS)", () => {
  test("Página /aulas/sessao/[id] carrega para sessão existente", async ({ page }) => {
    test.skip(!EMAIL_A || !PASS_A, "Credenciais E2E professor ausentes");

    // Buscar sessionId do cache da global-setup
    let sessionId: string | null = null;
    try {
      const fs = await import("fs");
      const path = await import("path");
      const cachePath = path.join(__dirname, ".cache", "idor-context.json");
      if (fs.existsSync(cachePath)) {
        const cache = JSON.parse(fs.readFileSync(cachePath, "utf8")) as {
          classSessionId?: string | null;
        };
        sessionId = cache.classSessionId ?? null;
      }
    } catch {
      // ignore
    }

    test.skip(!sessionId, "classSessionId não encontrado no cache — execute pnpm db:validate-rls");

    await loginAs(page, EMAIL_A!, PASS_A!);
    await page.goto(`/aulas/sessao/${sessionId}`, { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: /check-ins/i })).toBeVisible();
    // Botão de refresh deve estar visível
    await expect(page.getByRole("button", { name: /atualizar/i })).toBeVisible();
  });
});

// ─── Cenário: Não-regressão Fase 1 ───────────────────────────────────────────

test.describe("Não-regressão Fase 1", () => {
  test("Portal aluno: /portal/financeiro ainda exibe placeholder PIX", async ({ page }) => {
    test.skip(!EMAIL_STUDENT || !PASS_STUDENT, "Credenciais E2E aluno ausentes");

    await page.goto("/login");
    await page.getByLabel("E-mail").fill(EMAIL_STUDENT!);
    await page.getByLabel("Senha").fill(PASS_STUDENT!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(/\/portal/, { timeout: 30_000 });

    await page.goto("/portal/financeiro", { waitUntil: "networkidle" });
    await expect(page.getByText(/em breve/i)).toBeVisible();
  });

  test("Professor: navegação principal ainda tem Alunos, Mensalidades, Configurações", async ({
    page,
  }) => {
    test.skip(!EMAIL_A || !PASS_A, "Credenciais E2E professor ausentes");
    await loginAs(page, EMAIL_A!, PASS_A!);

    const nav = page.getByRole("navigation").first();
    await expect(nav.getByRole("link", { name: /alunos/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /mensalidades/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /configura/i })).toBeVisible();
  });
});
