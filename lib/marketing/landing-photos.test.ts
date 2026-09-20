import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const MARKETING_DIR = join(process.cwd(), "components/marketing");
const LANDING_PAGE_SOURCE = join(MARKETING_DIR, "landing-page.tsx");

/** Retired AI marketing set. Landing must not keep any of these filenames. */
const BANNED_AI_MARKETING_FILENAMES = [
  "lp-tatame-sparring.png",
  "lp-coach-laptop.png",
  "lp-class-lines.png",
  "lp-blue-belt.png",
  "lp-mat-laptop.png",
] as const;

const SYSTEM_CAPABILITY_LABELS = [
  "Alunos",
  "Graduação",
  "Mensalidades",
  "Painel",
  "Documentos",
] as const;

function readMarketingSources(): string {
  return readdirSync(MARKETING_DIR)
    .filter((name) => /\.(tsx|ts)$/.test(name))
    .map((name) => readFileSync(join(MARKETING_DIR, name), "utf8"))
    .join("\n");
}

describe("LandingPage photographs", () => {
  it("does not reference the retired AI marketing photographs", () => {
    const source = readMarketingSources();

    for (const filename of BANNED_AI_MARKETING_FILENAMES) {
      expect(source.includes(filename), `Landing still references ${filename}`).toBe(false);
    }
  });
});

describe("LandingPage system video section", () => {
  it("includes the Remotion region, right-column capability texts, and cards without titles or tags", () => {
    const landing = readFileSync(LANDING_PAGE_SOURCE, "utf8");
    const marketing = readMarketingSources();

    expect(landing.includes("lp-system-video"), "LandingPage must mount the system-video section").toBe(
      true,
    );
    expect(marketing).toContain('data-testid="lp-system-video"');
    expect(marketing).toContain("@remotion/player");
    expect(marketing).toContain('data-testid="lp-system-video-copy"');

    const copyStart = marketing.indexOf('data-testid="lp-system-video-copy"');
    expect(copyStart).toBeGreaterThanOrEqual(0);
    const copyRegion = marketing.slice(copyStart, copyStart + 2500);
    for (const label of SYSTEM_CAPABILITY_LABELS) {
      expect(copyRegion.includes(label), `Right column must mention ${label}`).toBe(true);
    }

    const remotionComposition = readdirSync(MARKETING_DIR)
      .filter((name) => /\.(tsx|ts)$/.test(name))
      .map((name) => ({ name, source: readFileSync(join(MARKETING_DIR, name), "utf8") }))
      .find(({ source }) => source.includes('from "remotion"') || source.includes("from 'remotion'"));

    expect(remotionComposition, "Remotion composition must live in marketing").toBeTruthy();
    expect(remotionComposition!.source).not.toMatch(/<h[1-6]\b/);
    expect(remotionComposition!.source).not.toMatch(/\btag\b/i);
    expect(remotionComposition!.source).not.toMatch(/\bcaption\b/i);
    expect(remotionComposition!.source).not.toMatch(/\blower-third\b/i);
    for (const label of SYSTEM_CAPABILITY_LABELS) {
      expect(
        remotionComposition!.source.includes(label),
        `Card composition must not render ${label} as a title`,
      ).toBe(false);
    }
  });
});
