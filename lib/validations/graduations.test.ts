import { describe, expect, it } from "vitest";

import { validateGraduatedAtNotFuture } from "@/lib/graduation/graduated-at";
import { weightKgSchema } from "@/lib/validations/graduations";

describe("weightKgSchema", () => {
  it("aceita valor válido com uma casa decimal", () => {
    expect(weightKgSchema.parse("72.5")).toBe(72.5);
  });

  it("rejeita abaixo de 20", () => {
    expect(() => weightKgSchema.parse(19.9)).toThrow();
  });

  it("rejeita acima de 250", () => {
    expect(() => weightKgSchema.parse(250.1)).toThrow();
  });

  it("normaliza vazio para null", () => {
    expect(weightKgSchema.parse("")).toBeNull();
  });
});

describe("validateGraduatedAtNotFuture", () => {
  it("rejeita data futura", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const y = future.getFullYear();
    const err = validateGraduatedAtNotFuture(`${y}-01-15`);
    expect(err).toMatch(/futuro/i);
  });
});
