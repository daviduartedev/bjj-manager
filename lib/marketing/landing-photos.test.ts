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

    // O vídeo vive na própria hero (cycle 1008, rodada 4).
    const heroSource = readFileSync(join(MARKETING_DIR, "lp-hero.tsx"), "utf8");
    expect(heroSource.includes("LpSystemVideo"), "LpHero must mount the system video").toBe(true);
    expect(landing.includes("LpHero"), "LandingPage must render the hero").toBe(true);
    expect(marketing).toContain('data-testid="lp-system-video"');
    expect(marketing).toContain("@remotion/player");
    expect(marketing).toContain('data-testid="lp-system-video-copy"');

    const videoSource = readFileSync(join(MARKETING_DIR, "lp-system-video.tsx"), "utf8");
    expect(videoSource).toContain('data-testid="lp-system-video-copy"');
    for (const label of SYSTEM_CAPABILITY_LABELS) {
      expect(videoSource.includes(label), `Right column must mention ${label}`).toBe(true);
    }

    // Vídeo-promo (cycle 1008): composição recriada em UI animada, em components/marketing/promo/.
    const PROMO_DIR = join(MARKETING_DIR, "promo");
    const promoSources = readdirSync(PROMO_DIR)
      .filter((name) => /\.(tsx|ts)$/.test(name))
      .map((name) => ({ name, source: readFileSync(join(PROMO_DIR, name), "utf8") }));

    expect(
      promoSources.some(({ source }) => source.includes('from "remotion"')),
      "Remotion composition must live in marketing/promo",
    ).toBe(true);
    for (const { name, source } of promoSources) {
      // Semântica fica na página; dentro do vídeo não há headings reais.
      expect(source, `${name} must not render heading elements`).not.toMatch(/<h[1-6]\b/);
    }
    expect(
      promoSources.some(({ source }) => source.includes("SceneNote")),
      "Each scene is announced with a scene note",
    ).toBe(true);
  });

  it("does not ship the old still-image slideshow", () => {
    const source = readMarketingSources();
    expect(source).not.toContain("lp-real-");
  });
});
