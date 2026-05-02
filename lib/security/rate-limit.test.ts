import { describe, expect, it } from "vitest";

import { allowRateLimit } from "./rate-limit";

describe("allowRateLimit", () => {
  it("permite até N pedidos na janela", () => {
    const now = 1_700_000_000_000;
    expect(allowRateLimit("k1", 3, 60_000, now)).toBe(true);
    expect(allowRateLimit("k1", 3, 60_000, now + 1)).toBe(true);
    expect(allowRateLimit("k1", 3, 60_000, now + 2)).toBe(true);
    expect(allowRateLimit("k1", 3, 60_000, now + 3)).toBe(false);
  });

  it("reinicia após expirar a janela", () => {
    const t0 = 1_700_000_000_000;
    expect(allowRateLimit("k2", 1, 1000, t0)).toBe(true);
    expect(allowRateLimit("k2", 1, 1000, t0 + 500)).toBe(false);
    expect(allowRateLimit("k2", 1, 1000, t0 + 1001)).toBe(true);
  });
});
