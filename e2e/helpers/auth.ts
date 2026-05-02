import type { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/painel/, { timeout: 30_000 });
}

export async function logoutViaShell(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Menu do utilizador" }).click();
  await page.getByRole("menuitem", { name: /^Sair$/ }).click();
  await page.waitForURL(/\/login/, { timeout: 30_000 });
}
