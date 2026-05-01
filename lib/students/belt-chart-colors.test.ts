import { describe, expect, it } from "vitest";

import { beltDistributionBarColor } from "./belt-chart-colors";

describe("beltDistributionBarColor", () => {
  it("maps adult slugs to stable colours", () => {
    expect(beltDistributionBarColor("blue", "adult")).toMatch(/^#/);
    expect(beltDistributionBarColor("black", "adult")).toBe("#0a0a0a");
  });

  it("falls back for unknown slugs", () => {
    expect(beltDistributionBarColor("unknown", "kids")).toMatch(/^#/);
  });
});
