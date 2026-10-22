import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultCreateStudentValues } from "@/lib/students/default-form-values";
import { referencedGraduationSummary } from "@/lib/modalities/referenced-graduation-summary";
import { buildQuickEditFormSchema, buildStudentFullFormSchema } from "./students";

const adult = { id: "20000000-0000-4000-8000-000000000001", kind: "adult" as const, name: "Adulto", active: true };
const input = { full_name: "Praticante graduada", kind: "adult", birth_date: "2008-10-22", academy_start_date: "2026-10-22", is_exempt: true,
  graduation_reference_id: "cbmtt-19-khan", current_rank_code: "khan-19", current_rank_date: null };
afterEach(() => vi.useRealTimers());
describe("cadastro e edição de Muay Thai", () => {
  it("envia iniciante explícito e data desconhecida nos valores reais do formulário", () => {
    const defaults = defaultCreateStudentValues([], [adult], "muay_thai");
    const result = buildStudentFullFormSchema([], [adult], "muay_thai").parse({ ...defaults, full_name: "Praticante", birth_date: "2000-01-01" });
    expect(result).toMatchObject({ graduation_reference_id: "cbmtt-19-khan", current_rank_code: "khan-1", current_rank_date: null, current_belt_id: null, current_degree: null });
  });
  it("aceita o aniversário18 civilSP, graduação preexistente e plano Adulto nas duas edições", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T02:59:00Z"));
    const schema = buildStudentFullFormSchema([], [adult], "muay_thai");
    expect(schema.parse({ ...input, is_exempt: false, plan_id: adult.id, due_day: 12 })).toMatchObject({ current_rank_code: "khan-19", current_rank_date: null });
    expect(schema.parse({ ...input, current_rank_code: "khan-15", current_rank_date: "2025-04-05" }).current_rank_date).toBe("2025-04-05");
    const quick = buildQuickEditFormSchema([], [adult], "adult", "muay_thai");
    expect(quick.parse({ status: "paused", is_exempt: true, graduation_reference_id: "cbmtt-19-khan", current_rank_code: "khan-13", current_rank_date: null }).current_rank_date).toBeNull();
    expect(referencedGraduationSummary(input, "2026-10-22")).toMatchObject({ rank: { label: "19º khan — Dourado — Grão Mestre / Arjarn Yai (honraria)" }, dateLabel: "Data não informada", durationLabel: "Tempo indisponível" });
  });
  it("recusa menor amanhã, referência Judô, listrasJJ, graduação ausente e datas omitidas/inválidas/futuras", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T02:59:00Z"));
    const schema = buildStudentFullFormSchema([], [adult], "muay_thai");
    for (const values of [
      { ...input, birth_date: "2008-10-23" }, { ...input, kind: "kids" },
      { ...input, graduation_reference_id: "cbj-2023", current_rank_code: "dan-1" },
      { ...input, current_rank_code: null }, { ...input, current_rank_code: "khan-20" },
      { ...input, current_degree: 0 }, { ...input, current_rank_date: undefined },
      { ...input, current_rank_date: "2025-02-30" }, { ...input, current_rank_date: "2026-10-23" },
    ]) expect(schema.safeParse(values).success).toBe(false);
    const kids = { id: "20000000-0000-4000-8000-000000000002", kind: "kids_1" as const };
    expect(buildStudentFullFormSchema([], [kids], "muay_thai").safeParse({ ...input, is_exempt: false, plan_id: kids.id, due_day: 12 }).success).toBe(false);
    const quick = buildQuickEditFormSchema([], [kids], "adult", "muay_thai");
    expect(quick.safeParse({ status: "active", is_exempt: false, plan_id: kids.id, due_day: 12, graduation_reference_id: "cbmtt-19-khan", current_rank_code: "khan-1", current_rank_date: null }).success).toBe(false);
    expect(quick.safeParse({ status: "active", is_exempt: true, graduation_reference_id: "cbj-2023", current_rank_code: "dan-1", current_rank_date: null }).success).toBe(false);
  });
});
