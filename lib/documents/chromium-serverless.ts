import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import type { RenderHtmlToPdfOptions } from "./pdf-types";

const defaultMargin = {
  top: "16mm",
  right: "16mm",
  bottom: "16mm",
  left: "16mm",
} as const;

type SparticuzChromiumMod = typeof import("@sparticuz/chromium");

/**
 * O pacote só extrai AL2023 + configura LD_LIBRARY_PATH no **load**, se parecer Lambda.
 * Na Vercel `AWS_*` costuma estar vazio → Chromium rebenta ao arrancar. Spoof só aqui,
 * antes do primeiro `import("@sparticuz/chromium")` deste processo.
 */
function primeSparticuzForVercelServerless(): void {
  if (!process.env.VERCEL) return;
  process.env.HOME ??= "/tmp";
  if (process.env.SP_ARTICUZ_DISABLE_LAMBDA_SPOOF === "1") return;
  const execEnv = process.env.AWS_EXECUTION_ENV ?? "";
  if (!/^AWS_Lambda_nodejs(?:20|22)\.x\b/i.test(execEnv)) {
    process.env.AWS_EXECUTION_ENV = "AWS_Lambda_nodejs22.x";
  }
}

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
 * Na Vercel use `POST /api/internal/pdf-from-html` para empacotar bem o trace.
 */
export async function renderWithServerlessChromium(
  html: string,
  options: RenderHtmlToPdfOptions,
): Promise<Buffer> {
  primeSparticuzForVercelServerless();

  const puppeteer = await import("puppeteer-core");
  const Chromium = await loadSparticuzChromium();

  /*
   * Nota Sparticuz 131+: o setter `setGraphicsMode = false` é ignorado (sempre força graphics).
   * Mantemos a linha só para ficar estável quando o pacote voltar a respeitar o flag.
   */
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

  const cwdBin = path.join(
    process.cwd(),
    "node_modules",
    "@sparticuz",
    "chromium",
    "bin",
  );
  const binDir = existsSync(cwdBin) ? cwdBin : undefined;

  let browser:
    | Awaited<ReturnType<(typeof puppeteer)["default"]["launch"]>>
    | null = null;
  try {
    const executablePath = binDir
      ? await Chromium.executablePath(binDir)
      : await Chromium.executablePath();

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
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
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
