import { describe, expect, it } from "vitest";

import { buildStudentFullFormSchema } from "@/lib/validations/students";

const beltAdult = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "white",
  kind: "adult" as const,
};
const beltKids = {
  id: "10000000-0000-4000-8000-000000000002",
  slug: "white",
  kind: "kids" as const,
};
const planAdult = {
  id: "20000000-0000-4000-8000-000000000001",
  kind: "adult" as const,
};
const planKids = {
  id: "20000000-0000-4000-8000-000000000002",
  kind: "kids_1" as const,
};

const baseInput = {
  full_name: "Teste Silva",
  birth_date: "2010-05-01",
  academy_start_date: "2024-01-15",
  kind: "adult" as const,
  current_belt_id: beltAdult.id,
  current_degree: 0,
  plan_id: planAdult.id,
  due_day: 10,
};

describe("buildStudentFullFormSchema", () => {
  const schema = buildStudentFullFormSchema(
    [beltAdult, beltKids],
    [planAdult, planKids],
  );

  it("aceita combinação adulto + plano adulto + faixa adulta", () => {
    const r = schema.safeParse(baseInput);
    expect(r.success).toBe(true);
  });

  it("rejeita adulto com plano kids (STU-4)", () => {
    const r = schema.safeParse({ ...baseInput, plan_id: planKids.id });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.plan_id?.length).toBeGreaterThan(0);
    }
  });

  it("rejeita CPF com dígitos inválidos (STU-6)", () => {
    const r = schema.safeParse({
      ...baseInput,
      document: "111.111.111-11",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.document?.length).toBeGreaterThan(0);
    }
  });
});
