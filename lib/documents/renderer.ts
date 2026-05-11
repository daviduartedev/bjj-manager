import "server-only";

import { type Browser, chromium } from "playwright";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
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

export type RenderHtmlToPdfOptions = {
  format?: "A4" | "Letter";
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  printBackground?: boolean;
};

export async function renderHtmlToPdf(
  html: string,
  options: RenderHtmlToPdfOptions = {},
): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer = await page.pdf({
      format: options.format ?? "A4",
      printBackground: options.printBackground ?? true,
      margin: options.margin ?? {
        top: "16mm",
        right: "16mm",
        bottom: "16mm",
        left: "16mm",
      },
    });
    return pdfBuffer;
  } finally {
    await context.close();
  }
}
