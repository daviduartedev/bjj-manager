import type { AcademyModality } from "@/lib/modalities/catalog";
import type { BeltCatalogRow, PlanCatalogRow } from "@/lib/data/students-catalog";
import type { StudentFullFormValues } from "@/lib/validations/students";
import { getReferencedRanks } from "@/lib/modalities/referenced-ranks";

/** Valores iniciais para novo aluno (primeiro adulto/plano adulto do catálogo). */
export function defaultCreateStudentValues(
  belts: BeltCatalogRow[],
  plans: PlanCatalogRow[],
  modality: AcademyModality = "jiu_jitsu",
): StudentFullFormValues {
  const today = new Date().toISOString().slice(0, 10);
  const adultBelt = belts.find((b) => b.kind === "adult");
  const adultPlan = plans.find((p) => p.kind === "adult");
  const initialRank = getReferencedRanks(modality)[0];
  return {
    full_name: "",
    birth_date: today,
    academy_start_date: today,
    kind: "adult",
    current_belt_id: modality !== "jiu_jitsu" ? null : adultBelt?.id ?? "",
    current_degree: modality !== "jiu_jitsu" ? null : 0,
    ...(initialRank ? { graduation_reference_id: initialRank.referenceId, current_rank_code: initialRank.code, current_rank_date: null } : {}),
    is_exempt: false,
    plan_id: adultPlan?.id ?? "",
    due_day: 10,
    document: undefined,
    phone: undefined,
    email: undefined,
    notes: undefined,
  };
}
