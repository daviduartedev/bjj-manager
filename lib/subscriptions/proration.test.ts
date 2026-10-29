import { describe, expect, it } from "vitest";

import { proratedUpgradeCents } from "./proration";

describe("diferença proporcional do upgrade", () => {
  it("calcula a diferença restante do ciclo sem aceitar valor externo", () => {
    expect(proratedUpgradeCents({
      fromCents: 9900, toCents: 17900,
      periodStart: "2026-10-29T12:00:00.000Z", paidUntil: "2026-11-29T12:00:00.000Z",
      now: new Date("2026-11-13T12:00:00.000Z"),
    })).toBe(4129);
  });

  it("recusa downgrade, ciclo encerrado ou datas inválidas", () => {
    const now = new Date("2026-11-13T12:00:00.000Z");
    const period = { periodStart: "2026-10-29T12:00:00.000Z", paidUntil: "2026-11-29T12:00:00.000Z", now };
    expect(proratedUpgradeCents({ fromCents: 17900, toCents: 9900, ...period })).toBeNull();
    expect(proratedUpgradeCents({ fromCents: 9900, toCents: 17900, ...period, now: new Date("2026-11-29T12:00:00.000Z") })).toBeNull();
    expect(proratedUpgradeCents({ fromCents: 9900, toCents: 17900, periodStart: "invalid", paidUntil: period.paidUntil, now })).toBeNull();
  });
});
