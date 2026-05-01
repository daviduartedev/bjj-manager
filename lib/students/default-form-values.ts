import type { BeltCatalogRow, PlanCatalogRow } from "@/lib/data/students-catalog";
import type { StudentFullFormValues } from "@/lib/validations/students";

/** Valores iniciais para novo aluno (primeiro adulto/plano adulto do catálogo). */
export function defaultCreateStudentValues(
  belts: BeltCatalogRow[],
  plans: PlanCatalogRow[],
): StudentFullFormValues {
  const today = new Date().toISOString().slice(0, 10);
  const adultBelt = belts.find((b) => b.kind === "adult");
  const adultPlan = plans.find((p) => p.kind === "adult");
  return {
    full_name: "",
    birth_date: today,
    academy_start_date: today,
    kind: "adult",
    current_belt_id: adultBelt?.id ?? "",
    current_degree: 0,
    plan_id: adultPlan?.id ?? "",
    due_day: 10,
    document: undefined,
    phone: undefined,
    email: undefined,
    notes: undefined,
  };
}
