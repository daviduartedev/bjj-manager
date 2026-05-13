import "server-only";

import type { Browser } from "playwright";
import { chromium as playwrightChromium } from "playwright";

import type { RenderHtmlToPdfOptions } from "./pdf-types";

export type { RenderHtmlToPdfOptions } from "./pdf-types";

function resolvePdfDriver(): "playwright" | "serverless-chromium" {
  const v = process.env.PDF_RENDERER_DRIVER?.trim().toLowerCase();
  /** Slugs REC-3.3 (`playwright-local`) e variantes compatíveis. */
  if (
    v === "playwright-local" ||
    v === "playwright" ||
    v === "local"
  ) {
    return "playwright";
  }
  /** REC-3.3 `puppeteer-serverless`; sinónimos aceites no ciclo técnico. */
  if (
    v === "puppeteer-serverless" ||
    v === "serverless-chromium" ||
    v === "chromium-serverless" ||
    v === "vercel"
  ) {
    return "serverless-chromium";
  }
  if (process.env.VERCEL) return "serverless-chromium";
  return "playwright";
}

let browserPromise: Promise<Browser> | null = null;

async function getPlaywrightBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = playwrightChromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
  }
  return browserPromise;
}

export async function shutdownRenderer(): Promise<void> {
  if (browserPromise) {
    const b = await browserPromise;
    browserPromise = null;
    await b.close();
  }
}

const defaultMargin = {
  top: "16mm",
  right: "16mm",
  bottom: "16mm",
  left: "16mm",
} as const;

async function renderWithPlaywright(
  html: string,
  options: RenderHtmlToPdfOptions,
): Promise<Buffer> {
  const browser = await getPlaywrightBrowser();
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer = await page.pdf({
      format: options.format ?? "A4",
      printBackground: options.printBackground ?? true,
      margin: options.margin ?? defaultMargin,
    });
    return pdfBuffer;
  } finally {
    await context.close();
  }
}

function stripTrailingSlash(u: string): string {
  return u.replace(/\/$/, "");
}

/**
 * Host do self-fetch para a rota interna de PDF.
 * Deve coincidir com **este** deployment (`VERCEL_URL`). Chamar `NEXT_PUBLIC_APP_URL`
 * (domínio customizado) a partir da Lambda costuma rebentar com **DEPLOYMENT_NOT_FOUND**
 * no edge da Vercel. Com Deployment Protection em `*.vercel.app`, usar
 * `VERCEL_AUTOMATION_BYPASS_SECRET` no header (já injectado pela Vercel quando activo).
 * Só use **PDF_RENDER_ORIGIN** se souberes que precisas de outro host explícito.
 */
function resolveInternalPdfRenderOrigin(): string {
  const explicit = process.env.PDF_RENDER_ORIGIN?.trim();
  if (explicit?.length) {
    return stripTrailingSlash(explicit);
  }

  const vu = process.env.VERCEL_URL?.trim();
  if (vu?.length) {
    const host = vu.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  const pub = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (pub?.length) {
    return stripTrailingSlash(pub);
  }

  throw new Error(
    "Defina PDF_RENDER_ORIGIN ou VERCEL_URL ou NEXT_PUBLIC_APP_URL para renderizar PDF na Vercel.",
  );
}

async function renderPdfViaInternalPost(
  html: string,
  options: RenderHtmlToPdfOptions,
  token: string,
): Promise<Buffer> {
  const origin = resolveInternalPdfRenderOrigin();

  /** Vercel injeita quando “Protection Bypass for Automation” está activo; cópia manual opcional na env. */
  const rawBypassA =
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() ?? "";
  const rawBypassB =
    process.env.PDF_DEPLOYMENT_PROTECTION_BYPASS?.trim() ?? "";
  const vercelBypass =
    rawBypassA.length > 0 ? rawBypassA : rawBypassB;

  const bypassQp =
    vercelBypass.length > 0
      ? `?${new URLSearchParams({ "x-vercel-protection-bypass": vercelBypass }).toString()}`
      : "";

  const url = `${origin}/api/internal/pdf-from-html${bypassQp}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* Header + query: em alguns caminhos o edge só aplica o bypass por um dos lados. */
  if (vercelBypass.length > 0) {
    (headers as Record<string, string>)["x-vercel-protection-bypass"] =
      vercelBypass;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ html, options }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (
      res.status === 401 &&
      (errText.includes("Authentication Required") ||
        errText.includes("Vercel Authentication"))
    ) {
      throw new Error(
        "PDF bloqueado pelo Deployment Protection da Vercel. Active “Protection Bypass for Automation” no projecto (ou defina PDF_DEPLOYMENT_PROTECTION_BYPASS igual ao bypass) e redesploy.",
      );
    }
    throw new Error(
      `PDF interno falhou (${res.status}): ${errText.slice(0, 500)}`,
    );
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/pdf")) {
    throw new Error("Resposta do renderizador interno não é PDF.");
  }

  return Buffer.from(await res.arrayBuffer());
}

export async function renderHtmlToPdf(
  html: string,
  options: RenderHtmlToPdfOptions = {},
): Promise<Buffer> {
  const driver = resolvePdfDriver();
  if (driver === "playwright") {
    return renderWithPlaywright(html, options);
  }

  if (process.env.VERCEL) {
    const token = process.env.PDF_INTERNAL_RENDER_TOKEN?.trim();
    if (!token || token.length < 24) {
      throw new Error(
        "PDF_INTERNAL_RENDER_TOKEN em falta ou curto demais (mín. 24). Necessário na Vercel para gerar PDF.",
      );
    }
    return renderPdfViaInternalPost(html, options, token);
  }

  const { renderWithServerlessChromium } = await import("./chromium-serverless");
  return renderWithServerlessChromium(html, options);
}
