import { describe, expect, it } from "vitest";

import {
  setStudentPlanSchema,
  updatePlanPriceSchema,
} from "./billing";

describe("updatePlanPriceSchema", () => {
  it("aceita UUID e centavos não negativos", () => {
    const r = updatePlanPriceSchema.safeParse({
      planId: "550e8400-e29b-41d4-a716-446655440000",
      priceCents: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejeita preço negativo", () => {
    const r = updatePlanPriceSchema.safeParse({
      planId: "550e8400-e29b-41d4-a716-446655440000",
      priceCents: -1,
    });
    expect(r.success).toBe(false);
  });
});

describe("setStudentPlanSchema", () => {
  const base = {
    studentId: "550e8400-e29b-41d4-a716-446655440001",
    planId: "550e8400-e29b-41d4-a716-446655440002",
    dueDay: 15,
  };

  it("aceita due_day 1 e 28", () => {
    expect(setStudentPlanSchema.safeParse({ ...base, dueDay: 1 }).success).toBe(
      true,
    );
    expect(setStudentPlanSchema.safeParse({ ...base, dueDay: 28 }).success).toBe(
      true,
    );
  });

  it("rejeita due_day fora do intervalo", () => {
    expect(setStudentPlanSchema.safeParse({ ...base, dueDay: 0 }).success).toBe(
      false,
    );
    expect(setStudentPlanSchema.safeParse({ ...base, dueDay: 29 }).success).toBe(
      false,
    );
  });

  it("aceita customPriceCents null ou inteiro >= 0", () => {
    expect(
      setStudentPlanSchema.safeParse({ ...base, customPriceCents: null }).success,
    ).toBe(true);
    expect(
      setStudentPlanSchema.safeParse({ ...base, customPriceCents: 99 }).success,
    ).toBe(true);
  });

  it("omitir customPriceCents mantém parsing válido", () => {
    expect(setStudentPlanSchema.safeParse(base).success).toBe(true);
  });
});
