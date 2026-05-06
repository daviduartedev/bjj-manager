import { describe, expect, it } from "vitest";

import { isLikelyMissingProducts003Columns } from "@/lib/data/products-page";

describe("isLikelyMissingProducts003Columns", () => {
  it("detecta mensagem PostgREST típica para audience", () => {
    expect(
      isLikelyMissingProducts003Columns({
        message:
          "Could not find the 'audience' column of 'products' in the schema cache",
      }),
    ).toBe(true);
  });

  it("detecta line em product_variants", () => {
    expect(
      isLikelyMissingProducts003Columns({
        message:
          "Could not find the 'line' column of 'product_variants' in the schema cache",
      }),
    ).toBe(true);
  });

  it("não confunde erro de tabela inexistente sem mention de coluna nova", () => {
    expect(
      isLikelyMissingProducts003Columns({
        message: 'relation "public.products" does not exist',
      }),
    ).toBe(false);
  });
});
