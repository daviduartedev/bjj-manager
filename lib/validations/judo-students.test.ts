import { defaultCreateStudentValues } from "@/lib/students/default-form-values";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildQuickEditFormSchema, buildStudentFullFormSchema } from "./students";
const adult = { id: "20000000-0000-4000-8000-000000000001", kind: "adult" as const };
const input = { full_name: "Judoca", kind: "adult", birth_date: "2008-10-22", academy_start_date: "2026-10-22", is_exempt: true,
  graduation_reference_id: "cbj-2023", current_rank_code: "dan-5", current_rank_date: null };
afterEach(() => vi.useRealTimers());
describe("ficha de Judô", () => {
  it("cadastra graduado diretamente com data desconhecida explícita, edita e aceita plano Adulto", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T02:59:00Z"));
    const schema = buildStudentFullFormSchema([], [adult], "judo");
    const result = schema.parse({ ...input, is_exempt: false, plan_id: adult.id, due_day: 12 });
    expect(result.current_rank_date).toBeNull();
    const quick = buildQuickEditFormSchema([], [adult], "adult", "judo");
    expect(quick.safeParse({ status: "paused", is_exempt: true, graduation_reference_id: "cbj-2023", current_rank_code: "kyu-11", current_rank_date: null }).success).toBe(true);
  });
});

describe("limites da ficha de Judô", () => {
  it("exige graduação e decisão explícita de data, recusa referência estrangeira e listras JJ", () => {
    const schema = buildStudentFullFormSchema([], [adult], "judo");
    for (const values of [
      { ...input, current_rank_code: undefined }, { ...input, current_rank_code: "dan-11" },
      { ...input, graduation_reference_id: "cbmtt-19-khan" }, { ...input, current_degree: 0 },
      { ...input, current_rank_date: undefined }, { ...input, current_rank_date: "2025-02-30" },
      { ...input, current_rank_date: "2099-01-01" },
    ]) expect(schema.safeParse(values).success).toBe(false);
    expect(schema.safeParse({ ...input, current_rank_code: "beginner", current_rank_date: "2025-04-05" }).success).toBe(true);
    expect(buildStudentFullFormSchema([], [], "boxing").safeParse(input).success).toBe(false);
  });
  it("recusa menor de18 amanhã e plano infantil nas edições", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T02:59:00Z"));
    const kids = { id: "20000000-0000-4000-8000-000000000002", kind: "kids_1" as const };
    const schema = buildStudentFullFormSchema([], [adult,kids], "judo");
    expect(schema.safeParse({ ...input, birth_date: "2008-10-23" }).success).toBe(false);
    expect(schema.safeParse({ ...input, kind: "kids" }).success).toBe(false);
    expect(schema.safeParse({ ...input, is_exempt: false, plan_id: kids.id, due_day: 12 }).success).toBe(false);
    expect(buildQuickEditFormSchema([], [kids], "adult", "judo").safeParse({ status: "active", plan_id: kids.id, due_day:12, graduation_reference_id:"cbj-2023",current_rank_code:"beginner",current_rank_date:null }).success).toBe(false);
  });
});

it("envia os valores iniciais do formulário como iniciante sem grau de JJ e sem data fabricada", () => {
  const defaults = defaultCreateStudentValues([], [{...adult,name:"Adulto",active:true}], "judo");
  const result = buildStudentFullFormSchema([], [adult], "judo").safeParse({ ...defaults, full_name:"Iniciante",birth_date:"2000-01-01" });
  expect(result.success).toBe(true);
  expect(defaults).toMatchObject({ current_belt_id:null,current_degree:null,graduation_reference_id:"cbj-2023",current_rank_code:"beginner",current_rank_date:null });
});
