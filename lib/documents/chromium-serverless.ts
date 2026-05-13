import "server-only";

import type { RenderHtmlToPdfOptions } from "./pdf-types";

const defaultMargin = {
  top: "16mm",
  right: "16mm",
  bottom: "16mm",
  left: "16mm",
} as const;

type SparticuzChromiumMod = typeof import("@sparticuz/chromium");

async function loadSparticuzChromium(): Promise<SparticuzChromiumMod> {
  const mod = await import("@sparticuz/chromium");
  if (typeof mod === "object" && mod !== null && "default" in mod) {
    const d = (mod as { default?: SparticuzChromiumMod }).default;
    if (d) return d;
  }
  return mod as SparticuzChromiumMod;
}

/**
 * Puppeteer + @sparticuz/chromium (só para ambientes serverless com filesystem completo).
 * Na Vercel use a rota `POST /api/internal/pdf-from-html` para manter o binário fora das Server Actions.
 */
export async function renderWithServerlessChromium(
  html: string,
  options: RenderHtmlToPdfOptions,
): Promise<Buffer> {
  if (process.env.VERCEL) {
    process.env.HOME ??= "/tmp";
  }

  const puppeteer = await import("puppeteer-core");
  const Chromium = await loadSparticuzChromium();
  try {
    Chromium.setGraphicsMode = false;
  } catch {
    /* ignore */
  }

  const margin = options.margin ?? defaultMargin;
  const printableMargin = {
    top: margin.top ?? defaultMargin.top,
    right: margin.right ?? defaultMargin.right,
    bottom: margin.bottom ?? defaultMargin.bottom,
    left: margin.left ?? defaultMargin.left,
  };

  let browser:
    | Awaited<ReturnType<(typeof puppeteer)["default"]["launch"]>>
    | null = null;
  try {
    const executablePath = await Chromium.executablePath();
    browser = await puppeteer.default.launch({
      args: Chromium.args,
      defaultViewport: Chromium.defaultViewport,
      executablePath,
      headless: Chromium.headless,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45_000);
    page.setDefaultTimeout(45_000);
    await page.setContent(html, {
      waitUntil: "load",
      timeout: 45_000,
    });
    const buf = await page.pdf({
      format: options.format ?? "A4",
      printBackground: options.printBackground ?? true,
      margin: printableMargin,
      timeout: 45_000,
    });
    return Buffer.from(buf);
  } finally {
    if (browser) await browser.close();
  }
}
