import { describe, expect, it } from "vitest";

import { DEFAULT_PLAN_PRICE_CENTS, DEFAULT_PLAN_ROWS } from "./constants";

describe("DEFAULT_PLAN_PRICE_CENTS / DEFAULT_PLAN_ROWS", () => {
  it("Kids 1 e Kids 2 a R$ 100, Adulto a R$ 120", () => {
    expect(DEFAULT_PLAN_PRICE_CENTS.kids_1).toBe(10_000);
    expect(DEFAULT_PLAN_PRICE_CENTS.kids_2).toBe(10_000);
    expect(DEFAULT_PLAN_PRICE_CENTS.adult).toBe(12_000);
  });

  it("não expõe Juvenil como nome de plano", () => {
    const names = DEFAULT_PLAN_ROWS.map((r) => r.name.toLowerCase()).join(" ");
    expect(names).not.toContain("juvenil");
    expect(DEFAULT_PLAN_ROWS.map((r) => r.kind).sort()).toEqual([
      "adult",
      "kids_1",
      "kids_2",
    ]);
  });
});
