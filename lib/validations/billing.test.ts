import { describe, expect, it } from "vitest";

import {
  recordPaymentSchema,
  recordPaymentsBulkSchema,
  setStudentPlanSchema,
  updatePlanPriceSchema,
  updatePlanSchema,
  voidPaymentSchema,
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

const recordBase = {
  studentId: "550e8400-e29b-41d4-a716-446655440000",
  referenceMonth: "2026-05-01",
};

describe("recordPaymentSchema", () => {
  it("assume recordingKind paid quando omitido", () => {
    const r = recordPaymentSchema.safeParse(recordBase);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.recordingKind).toBe("paid");
  });

  it("aceita recordingKind scholarship", () => {
    const r = recordPaymentSchema.safeParse({
      ...recordBase,
      recordingKind: "scholarship",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.recordingKind).toBe("scholarship");
  });

  it("rejeita amount_cents ou account_id enviados pelo cliente (strict)", () => {
    expect(
      recordPaymentSchema.safeParse({
        ...recordBase,
        amount_cents: 1,
      }).success,
    ).toBe(false);
    expect(
      recordPaymentSchema.safeParse({
        ...recordBase,
        account_id: "550e8400-e29b-41d4-a716-446655440099",
      }).success,
    ).toBe(false);
  });
});

describe("mass assignment strict (billing)", () => {
  it("updatePlanPriceSchema", () => {
    expect(
      updatePlanPriceSchema.safeParse({
        planId: "550e8400-e29b-41d4-a716-446655440000",
        priceCents: 100,
        account_id: "550e8400-e29b-41d4-a716-446655440001",
      }).success,
    ).toBe(false);
  });

  it("updatePlanSchema", () => {
    expect(
      updatePlanSchema.safeParse({
        planId: "550e8400-e29b-41d4-a716-446655440000",
        name: "X",
        extra: true,
      }).success,
    ).toBe(false);
  });

  it("setStudentPlanSchema", () => {
    expect(
      setStudentPlanSchema.safeParse({
        studentId: "550e8400-e29b-41d4-a716-446655440001",
        planId: "550e8400-e29b-41d4-a716-446655440002",
        dueDay: 15,
        student_plans: [],
      }).success,
    ).toBe(false);
  });

  it("recordPaymentsBulkSchema", () => {
    expect(
      recordPaymentsBulkSchema.safeParse({
        studentIds: ["550e8400-e29b-41d4-a716-446655440000"],
        referenceMonth: "2026-05-01",
        bypass_rls: true,
      }).success,
    ).toBe(false);
  });

  it("voidPaymentSchema", () => {
    expect(
      voidPaymentSchema.safeParse({
        paymentId: "550e8400-e29b-41d4-a716-446655440000",
        force: true,
      }).success,
    ).toBe(false);
  });
});
