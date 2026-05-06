import { describe, expect, it } from "vitest";

import {
  buildQuickEditFormSchema,
  buildStudentFullFormSchema,
} from "@/lib/validations/students";

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
const beltKidsOrange = {
  id: "10000000-0000-4000-8000-000000000004",
  slug: "orange",
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
const planKids2 = {
  id: "20000000-0000-4000-8000-000000000003",
  kind: "kids_2" as const,
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
  const plansTriple = [planAdult, planKids, planKids2];
  const schema = buildStudentFullFormSchema(
    [beltAdult, beltKids, beltKidsOrange],
    plansTriple,
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

  it("rejeita kids fora da família laranja com plano Adulto", () => {
    const r = schema.safeParse({
      ...baseInput,
      kind: "kids" as const,
      current_belt_id: beltKids.id,
      plan_id: planAdult.id,
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.plan_id?.length).toBeGreaterThan(0);
    }
  });

  it("aceita kids faixa laranja com plano Adulto", () => {
    const r = schema.safeParse({
      ...baseInput,
      kind: "kids" as const,
      current_belt_id: beltKidsOrange.id,
      plan_id: planAdult.id,
    });
    expect(r.success).toBe(true);
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

  it("rejeita chaves extra (mass assignment / SECE2E)", () => {
    const r = schema.safeParse({
      ...baseInput,
      account_id: "550e8400-e29b-41d4-a716-446655440099",
      status: "inactive",
    });
    expect(r.success).toBe(false);
  });
});

describe("buildQuickEditFormSchema strict", () => {
  const beltAdult = {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "white",
    kind: "adult" as const,
  };
  const planAdult = {
    id: "20000000-0000-4000-8000-000000000001",
    kind: "adult" as const,
  };
  const schema = buildQuickEditFormSchema([beltAdult], [planAdult], "adult");
  const base = {
    status: "active" as const,
    plan_id: planAdult.id,
    due_day: 10,
    current_belt_id: beltAdult.id,
    current_degree: 0,
  };

  it("rejeita account_id ou full_name injectados", () => {
    expect(
      schema.safeParse({ ...base, account_id: "550e8400-e29b-41d4-a716-446655440099" })
        .success,
    ).toBe(false);
    expect(schema.safeParse({ ...base, full_name: "X" }).success).toBe(false);
  });
});

describe("buildQuickEditFormSchema kids + Adulto", () => {
  const beltKids = {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "white",
    kind: "kids" as const,
  };
  const beltKidsOrange = {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "orange",
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
  const schema = buildQuickEditFormSchema(
    [beltKids, beltKidsOrange],
    [planAdult, planKids],
    "kids",
  );

  it("rejeita plano Adulto para kids fora da família laranja", () => {
    const r = schema.safeParse({
      status: "active",
      plan_id: planAdult.id,
      due_day: 10,
      current_belt_id: beltKids.id,
      current_degree: 0,
    });
    expect(r.success).toBe(false);
  });

  it("aceita plano Adulto para kids faixa laranja", () => {
    const r = schema.safeParse({
      status: "active",
      plan_id: planAdult.id,
      due_day: 10,
      current_belt_id: beltKidsOrange.id,
      current_degree: 0,
    });
    expect(r.success).toBe(true);
  });
});
