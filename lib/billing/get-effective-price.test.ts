import { describe, expect, it } from "vitest";

import { getEffectivePrice } from "./get-effective-price";

describe("getEffectivePrice", () => {
  it("usa preço personalizado quando definido", () => {
    expect(
      getEffectivePrice({
        customPriceCents: 5000,
        planPriceCents: 12000,
      }),
    ).toBe(5000);
  });

  it("usa preço do plano quando personalizado é nulo", () => {
    expect(
      getEffectivePrice({
        customPriceCents: null,
        planPriceCents: 12000,
      }),
    ).toBe(12000);
  });

  it("usa preço do plano quando personalizado é undefined", () => {
    expect(
      getEffectivePrice({
        customPriceCents: undefined,
        planPriceCents: 10000,
      }),
    ).toBe(10000);
  });
});
