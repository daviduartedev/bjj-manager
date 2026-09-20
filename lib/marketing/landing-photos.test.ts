import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const LANDING_PAGE_SOURCE = join(process.cwd(), "components/marketing/landing-page.tsx");

/** Retired AI marketing set. Landing must not keep any of these filenames. */
const BANNED_AI_MARKETING_FILENAMES = [
  "lp-tatame-sparring.png",
  "lp-coach-laptop.png",
  "lp-class-lines.png",
  "lp-blue-belt.png",
  "lp-mat-laptop.png",
] as const;

describe("LandingPage photographs", () => {
  it("does not reference the retired AI marketing photographs", () => {
    const source = readFileSync(LANDING_PAGE_SOURCE, "utf8");

    for (const filename of BANNED_AI_MARKETING_FILENAMES) {
      expect(source.includes(filename), `LandingPage still references ${filename}`).toBe(
        false,
      );
    }
  });
});
