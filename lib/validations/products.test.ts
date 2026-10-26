import { describe, expect, it } from "vitest";

import {
  createProductSchema,
  createProductVariantSchema,
  deleteProductVariantSchema,
  updateProductSchema,
  updateProductVariantSchema,
} from "@/lib/validations/products";

describe("createProductSchema", () => {
  it("aceita nome válido", () => {
    expect(createProductSchema.safeParse({ name: "Kit Kimono" }).success).toBe(
      true,
    );
  });

  it("rejeita nome curto", () => {
    const r = createProductSchema.safeParse({ name: "A" });
    expect(r.success).toBe(false);
  });
});

describe("updateProductSchema", () => {
  it("rejeita quando não há campos", () => {
    const r = updateProductSchema.safeParse({
      productId: "00000000-0000-4000-8000-000000000001",
    });
    expect(r.success).toBe(false);
  });

  it("aceita só active", () => {
    const r = updateProductSchema.safeParse({
      productId: "00000000-0000-4000-8000-000000000001",
      active: false,
    });
    expect(r.success).toBe(true);
  });

  it("aceita descrição e a marcação da vitrine", () => {
    const r = updateProductSchema.safeParse({
      productId: "00000000-0000-4000-8000-000000000001",
      description: "  Kimono azul  ",
      catalogVisible: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejeita descrição acima de 500 caracteres", () => {
    const r = updateProductSchema.safeParse({
      productId: "00000000-0000-4000-8000-000000000001",
      description: "a".repeat(501),
    });
    expect(r.success).toBe(false);
  });
});

describe("createProductVariantSchema", () => {
  it("rejeita estoque negativo", () => {
    const r = createProductVariantSchema.safeParse({
      productId: "00000000-0000-4000-8000-000000000001",
      sizeLabel: "M",
      stockQuantity: -1,
    });
    expect(r.success).toBe(false);
  });

  it("aceita criação com estoque zero por omissão", () => {
    const r = createProductVariantSchema.safeParse({
      productId: "00000000-0000-4000-8000-000000000001",
      sizeLabel: "M",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.stockQuantity).toBe(0);
  });
});

describe("updateProductVariantSchema", () => {
  it("rejeita quando não há campos", () => {
    const r = updateProductVariantSchema.safeParse({
      variantId: "00000000-0000-4000-8000-000000000002",
    });
    expect(r.success).toBe(false);
  });

  it("aceita só line", () => {
    const r = updateProductVariantSchema.safeParse({
      variantId: "00000000-0000-4000-8000-000000000002",
      line: "feminine",
    });
    expect(r.success).toBe(true);
  });

  it("aceita preço vazio ou zero e recusa preço negativo", () => {
    const id = "00000000-0000-4000-8000-000000000002";
    expect(updateProductVariantSchema.safeParse({ variantId: id, priceCents: null }).success).toBe(
      true,
    );
    expect(updateProductVariantSchema.safeParse({ variantId: id, priceCents: 0 }).success).toBe(
      true,
    );
    expect(updateProductVariantSchema.safeParse({ variantId: id, priceCents: -1 }).success).toBe(
      false,
    );
  });
});

describe("deleteProductVariantSchema", () => {
  it("aceita uuid", () => {
    expect(
      deleteProductVariantSchema.safeParse({
        variantId: "00000000-0000-4000-8000-000000000099",
      }).success,
    ).toBe(true);
  });
});
