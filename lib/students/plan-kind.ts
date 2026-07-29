import type { BeltKind, StudentKind } from "@/lib/students/degree";

export type PlanKind = "kids_1" | "kids_2" | "adult" | "baby";

const ORANGE_FAMILY_KIDS_BELTS = new Set([
  "orange_white",
  "orange",
  "orange_black",
]);

/** Família laranja kids: permissão para vínculo ao plano Adulto. */
export function isOrangeFamilyKidsBeltSlug(
  slug: string | null | undefined,
): boolean {
  return typeof slug === "string" && ORANGE_FAMILY_KIDS_BELTS.has(slug);
}

/**
 * Faixa permitida para o tipo de aluno no catálogo.
 * Adulto pode usar faixa kids só na família laranja (casos especiais, plano Adulto).
 * Baby usa faixas kids.
 */
export function beltMatchesStudentKindForBeltRow(
  belt: { kind: BeltKind; slug: string },
  studentKind: StudentKind,
): boolean {
  if (belt.kind === studentKind) return true;
  if (studentKind === "baby" && belt.kind === "kids") return true;
  return (
    studentKind === "adult" &&
    belt.kind === "kids" &&
    isOrangeFamilyKidsBeltSlug(belt.slug)
  );
}

/** Compatibilidade plano × tipo × faixa atual (STU-4 + faixa laranja). */
export function planKindMatchesStudentContext(args: {
  planKind: PlanKind;
  studentKind: StudentKind;
  beltSlug: string | null | undefined;
}): boolean {
  const { planKind, studentKind, beltSlug } = args;
  if (studentKind === "adult") return planKind === "adult";
  if (studentKind === "baby") return planKind === "baby";
  if (planKind === "kids_1" || planKind === "kids_2") return true;
  return isOrangeFamilyKidsBeltSlug(beltSlug);
}

/** Preferência ao mudar tipo/faixa: Baby, Kids 1, Kids 2, Adulto só se elegível. */
export function pickDefaultPlanForStudentContext<T extends { kind: PlanKind }>(
  plans: T[],
  studentKind: StudentKind,
  beltSlug: string | null | undefined,
): T | undefined {
  const compatible = plans.filter((p) =>
    planKindMatchesStudentContext({
      planKind: p.kind,
      studentKind,
      beltSlug,
    }),
  );
  if (studentKind === "adult") {
    return compatible.find((p) => p.kind === "adult");
  }
  if (studentKind === "baby") {
    return compatible.find((p) => p.kind === "baby");
  }
  return (
    compatible.find((p) => p.kind === "kids_1") ??
    compatible.find((p) => p.kind === "kids_2") ??
    compatible.find((p) => p.kind === "adult")
  );
}

/** **STU-4** — adult só `adult`; baby só `baby`; kids pode `kids_1`, `kids_2` ou `adult`. */
export function planKindMatchesStudentKind(
  planKind: PlanKind,
  studentKind: StudentKind,
): boolean {
  if (studentKind === "adult") return planKind === "adult";
  if (studentKind === "baby") return planKind === "baby";
  return (
    planKind === "kids_1" || planKind === "kids_2" || planKind === "adult"
  );
}

/** Preferência ao mudar tipo no formulário: baby → Baby; kids → Kids 1 se existir. */
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
  if (studentKind === "baby") {
    return compatible.find((p) => p.kind === "baby");
  }
  return (
    compatible.find((p) => p.kind === "kids_1") ??
    compatible.find((p) => p.kind === "kids_2") ??
    compatible.find((p) => p.kind === "adult")
  );
}
