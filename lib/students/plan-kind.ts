import type { StudentKind } from "@/lib/students/degree";

export type PlanKind = "kids_1" | "kids_2" | "adult";

/** **STU-4** — adult só `adult`; kids pode `kids_1`, `kids_2` ou `adult` (juvenil na mesa de adulto). */
export function planKindMatchesStudentKind(
  planKind: PlanKind,
  studentKind: StudentKind,
): boolean {
  if (studentKind === "adult") return planKind === "adult";
  return (
    planKind === "kids_1" || planKind === "kids_2" || planKind === "adult"
  );
}

/** Preferência ao mudar tipo no formulário: kids → Kids 1 se existir. */
export function pickDefaultPlanForStudentKind<T extends { kind: PlanKind }>(
  plans: T[],
  studentKind: StudentKind,
): T | undefined {
  const compatible = plans.filter((p) =>
    planKindMatchesStudentKind(p.kind, studentKind),
  );
  if (studentKind === "adult") {
    return compatible.find((p) => p.kind === "adult");
  }
  return (
    compatible.find((p) => p.kind === "kids_1") ??
    compatible.find((p) => p.kind === "kids_2") ??
    compatible.find((p) => p.kind === "adult")
  );
}
