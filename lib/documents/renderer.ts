import "server-only";

import type { Browser } from "playwright";
import { chromium as playwrightChromium } from "playwright";

export type RenderHtmlToPdfOptions = {
  format?: "A4" | "Letter";
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  printBackground?: boolean;
};

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

async function renderWithServerlessChromium(
  html: string,
  options: RenderHtmlToPdfOptions,
): Promise<Buffer> {
  const puppeteer = await import("puppeteer-core");
  const chromiumPack = await import("@sparticuz/chromium");

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
    const executablePath = await chromiumPack.default.executablePath();
    browser = await puppeteer.default.launch({
      args: chromiumPack.default.args,
      defaultViewport: chromiumPack.default.defaultViewport,
      executablePath,
      headless: chromiumPack.default.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const buf = await page.pdf({
      format: options.format ?? "A4",
      printBackground: options.printBackground ?? true,
      margin: printableMargin,
    });
    return Buffer.from(buf);
  } finally {
    if (browser) await browser.close();
  }
}

export async function renderHtmlToPdf(
  html: string,
  options: RenderHtmlToPdfOptions = {},
): Promise<Buffer> {
  const driver = resolvePdfDriver();
  if (driver === "playwright") return renderWithPlaywright(html, options);
  return renderWithServerlessChromium(html, options);
}
