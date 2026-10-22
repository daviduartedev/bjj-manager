import { afterEach, describe, expect, it, vi } from "vitest";
import { buildStudentFullFormSchema, buildQuickEditFormSchema } from "@/lib/validations/students";
afterEach(() => vi.useRealTimers());
const plan = { id: "20000000-0000-4000-8000-000000000001", kind: "adult" as const };
const input = { full_name: "Aluna Boxe", kind: "adult", birth_date: "2008-10-22", academy_start_date: "2026-10-22", plan_id: plan.id, due_day: 12 };
describe("cadastro e edição de Boxe", () => {
  it("aceita adulto sem graduação e plano Adulto sem catálogo de faixas", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T02:59:00Z"));
    expect(buildStudentFullFormSchema([], [plan], "boxing").safeParse(input).success).toBe(true);
    vi.useRealTimers();
  });
});

describe("limites de Boxe", () => {
  it("recusa aniversário de 18 amanhã na data civil de São Paulo", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T02:59:00Z"));
    const r = buildStudentFullFormSchema([], [plan], "boxing").safeParse({ ...input, birth_date: "2008-10-23" });
    vi.useRealTimers();
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.birth_date).toBeDefined();
  });
  it("recusa kids, grau zero e faixa forjada também na edição rápida", () => {
    const schema = buildStudentFullFormSchema([], [plan], "boxing");
    expect(schema.safeParse({ ...input, kind: "kids" }).success).toBe(false);
    expect(schema.safeParse({ ...input, current_degree: 0 }).success).toBe(false);
    const quick = buildQuickEditFormSchema([], [plan], "adult", "boxing");
    expect(quick.safeParse({ status: "active", plan_id: plan.id, due_day: 10, current_belt_id: plan.id }).success).toBe(false);
    expect(quick.safeParse({ status: "paused", is_exempt: true, weight_kg: 72.5 }).success).toBe(true);
  });
  it("exige plano Adulto e vencimento salvo Isento; aceita null real", () => {
    const schema = buildStudentFullFormSchema([], [plan], "boxing");
    expect(schema.safeParse({ ...input, current_belt_id: null, current_degree: null }).success).toBe(true);
    expect(schema.safeParse({ ...input, plan_id: undefined }).success).toBe(false);
    expect(schema.safeParse({ ...input, due_day: undefined }).success).toBe(false);
    expect(schema.safeParse({ ...input, is_exempt: true, plan_id: undefined, due_day: undefined }).success).toBe(true);
    expect(schema.safeParse({ ...input, is_exempt: true, plan_id: "" }).success).toBe(true);
  });
});
