import type { StudentKind } from "@/lib/students/degree";

export type PlanKind = "kids_1" | "kids_2" | "adult";

/** **STU-4.3** */
export function planKindMatchesStudentKind(
  planKind: PlanKind,
  studentKind: StudentKind,
): boolean {
  if (studentKind === "adult") return planKind === "adult";
  return planKind === "kids_1" || planKind === "kids_2";
}
