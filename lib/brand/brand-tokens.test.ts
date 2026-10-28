import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const GLOBALS_CSS = join(process.cwd(), "app/globals.css");
const TAILWIND_CONFIG = join(process.cwd(), "tailwind.config.ts");

/** Literais da paleta aprovada (referencia CBJ). Nao recalcular a partir do hex. */
const BRAND_BLUE = "208 100% 31%";
const BRAND_BLUE_DARK = "208 100% 50%";
const BRAND_GREEN = "146 100% 25%";
const BRAND_YELLOW = "45 100% 49%";
const SEMANTIC_RED = "357 73% 43%";

function cssBlock(source: string, selector: ":root" | ".dark"): string {
  const start = source.indexOf(`${selector} {`);
  if (start < 0) {
    throw new Error(`Bloco ${selector} nao encontrado`);
  }

  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }

  throw new Error(`Bloco ${selector} sem fechamento`);
}

function classRule(source: string, className: string): string {
  const match = new RegExp(`\\.${className}\\s*\\{`).exec(source);
  if (!match) {
    throw new Error(`Classe .${className} nao encontrada`);
  }

  const open = match.index + match[0].length - 1;
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }

  throw new Error(`Classe .${className} sem fechamento`);
}

function token(block: string, name: string): string {
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match?.[1]) {
    throw new Error(`Token --${name} nao encontrado`);
  }

  return match[1].replace(/\/\*[\s\S]*?\*\//g, "").trim();
}

describe("tokens da paleta de marca", () => {
  const css = readFileSync(GLOBALS_CSS, "utf8");
  const root = cssBlock(css, ":root");
  const dark = cssBlock(css, ".dark");

  it("usa o azul aprovado no primary, ring e item ativo do tema claro", () => {
    expect(token(root, "primary")).toBe(BRAND_BLUE);
    expect(token(root, "ring")).toBe(BRAND_BLUE);
    expect(token(root, "shell-active")).toBe(BRAND_BLUE);
  });

  it("mantem o destrutivo no vermelho semantico literal", () => {
    expect(token(root, "destructive")).toBe(SEMANTIC_RED);
  });

  it("aplica o azul da marca nos acentos do shell e no status info", () => {
    expect(token(root, "shell-edge-glow")).toBe(BRAND_BLUE);
    expect(token(root, "content-wash-accent")).toBe(BRAND_BLUE);
    expect(token(root, "status-info")).toBe(BRAND_BLUE);
    expect(token(root, "shell-nav-active-bg")).toBe("208 42% 14%");
  });

  it("usa verde e amarelo da marca nos status, com texto escuro legivel", () => {
    expect(token(root, "status-paid")).toBe(BRAND_GREEN);
    expect(token(root, "status-paid-foreground")).toBe("146 100% 18%");
    expect(token(root, "status-pending")).toBe(BRAND_YELLOW);
    expect(token(root, "status-pending-foreground")).toBe("45 100% 22%");
    expect(token(root, "status-overdue")).toBe(SEMANTIC_RED);
  });

  it("expoe verde e amarelo da marca como variaveis para os proximos tickets", () => {
    expect(token(root, "brand-blue")).toBe(BRAND_BLUE);
    expect(token(root, "brand-green")).toBe(BRAND_GREEN);
    expect(token(root, "brand-yellow")).toBe(BRAND_YELLOW);
  });

  it("usa azul mais claro no tema escuro e mantem o vermelho so no destrutivo", () => {
    expect(token(dark, "primary")).toBe(BRAND_BLUE_DARK);
    expect(token(dark, "ring")).toBe(BRAND_BLUE_DARK);
    expect(token(dark, "shell-active")).toBe(BRAND_BLUE_DARK);
    expect(token(dark, "shell-edge-glow")).toBe(BRAND_BLUE_DARK);
    expect(token(dark, "content-wash-accent")).toBe(BRAND_BLUE_DARK);
    expect(token(dark, "shell-nav-active-bg")).toBe("208 45% 12%");
    expect(token(dark, "destructive")).toBe("357 73% 50%");
    expect(token(dark, "status-overdue")).toBe("357 75% 55%");
    expect(token(dark, "status-paid")).toBe("146 70% 48%");
    expect(token(dark, "status-pending")).toBe("45 95% 58%");
    expect(token(dark, "status-info")).toBe("208 85% 58%");
  });
});

describe("paleta nomeada do Tailwind", () => {
  const source = readFileSync(TAILWIND_CONFIG, "utf8");

  it("expoe azul, verde, amarelo e preto novos, sem vermelho nomeado", () => {
    expect(source).toContain('black: "#050505"');
    expect(source).toContain('blue: "#0055A0"');
    expect(source).toContain('green: "#008038"');
    expect(source).toContain('yellow: "#F8B800"');

    const bjj = source.slice(source.indexOf("bjj:"), source.indexOf("brand:"));
    expect(bjj).not.toMatch(/\bred\s*:/);
  });

  it("mapeia brand.green e brand.yellow para as variaveis CSS", () => {
    expect(source).toContain('green: "hsl(var(--brand-green))"');
    expect(source).toContain('yellow: "hsl(var(--brand-yellow))"');
    expect(source).toContain('blue: "hsl(var(--brand-blue))"');
  });
});

describe("faixa da borda do menu", () => {
  const css = readFileSync(GLOBALS_CSS, "utf8");

  it("define a classe da faixa com verde, amarelo e azul da marca, nessa ordem", () => {
    const stripe = classRule(css, "brand-stripe-edge");
    const green = stripe.indexOf("var(--brand-green)");
    const yellow = stripe.indexOf("var(--brand-yellow)");
    const blue = stripe.indexOf("var(--brand-blue)");

    expect(green).toBeGreaterThanOrEqual(0);
    expect(yellow).toBeGreaterThan(green);
    expect(blue).toBeGreaterThan(yellow);
  });
});
