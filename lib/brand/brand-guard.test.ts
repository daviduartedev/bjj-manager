import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SCAN_ROOTS = ["app", "components", "lib"] as const;
const SOURCE_EXT = /\.(ts|tsx|css|mjs)$/;
/** Este arquivo cita os padroes de proposito; a varredura do repositorio o ignora. */
const SELF = "lib/brand/brand-guard.test.ts";

const BRAND_RED_HEX = /#bf1e27/gi;
const NAMED_BRAND_RED = /\bbjj-red\b|\bbjj\.red\b/gi;
const TAILWIND_RED_ROSE =
  /\b(text|bg|border|ring|from|to|via|fill|stroke|shadow|outline|decoration|accent|caret|divide|placeholder)-(red|rose)-\d{2,3}\b/gi;

const PATTERNS = [BRAND_RED_HEX, NAMED_BRAND_RED, TAILWIND_RED_ROSE];

type BrandRedHit = {
  line: number;
  match: string;
};

/** Ocorrencias de vermelho de marca numa string. Independente da arvore do git. */
export function findBrandRedHits(source: string): BrandRedHit[] {
  const hits: BrandRedHit[] = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0;
      for (const match of line.matchAll(pattern)) {
        const text = match[0];
        if (!text) continue;
        hits.push({ line: index + 1, match: text });
      }
    }
  }

  return hits;
}

function trackedSourceFiles(): string[] {
  const output = execFileSync("git", ["ls-files", "--", ...SCAN_ROOTS], {
    encoding: "utf8",
    cwd: process.cwd(),
  });

  return output
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter((file) => file.length > 0 && SOURCE_EXT.test(file) && file !== SELF);
}

function scanTrackedBrandRed(): string[] {
  const violations: string[] = [];

  for (const file of trackedSourceFiles()) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    for (const hit of findBrandRedHits(source)) {
      violations.push(`${file}:${hit.line} ${hit.match}`);
    }
  }

  return violations;
}

describe("guarda de vermelho de marca", () => {
  it("detecta classe de marca e utilitario vermelho numa amostra", () => {
    const hits = findBrandRedHits("destaque bg-bjj-red e alerta text-red-500");

    expect(hits).toHaveLength(2);
    expect(hits.map((hit) => hit.match)).toEqual(["bjj-red", "text-red-500"]);
  });

  it("detecta o hex antigo de marca sem diferenciar maiusculas", () => {
    const hits = findBrandRedHits("color: #bf1e27;");

    expect(hits).toHaveLength(1);
    expect(hits[0]?.match.toLowerCase()).toBe("#bf1e27");
  });

  it("nao encontra vermelho de marca em app, components e lib rastreados", () => {
    expect(scanTrackedBrandRed()).toEqual([]);
  });
});
