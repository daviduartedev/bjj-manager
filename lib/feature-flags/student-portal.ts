/**
 * Feature flags do Portal do Aluno (**SPT-11**).
 * Defaults: todas desligadas até activação explícita via env.
 */

function parseBoolEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

/** Master switch — portal inacessível quando `false`. */
export function isStudentPortalEnabled(): boolean {
  return parseBoolEnv(process.env.NEXT_PUBLIC_STUDENT_PORTAL_ENABLED, false);
}

/** Aulas + check-in (Fase 2). */
export function isStudentPortalClassesCheckinEnabled(): boolean {
  return parseBoolEnv(process.env.NEXT_PUBLIC_STUDENT_PORTAL_CLASSES_CHECKIN, false);
}

/** Loja + reservas (Fase 3). */
export function isStudentPortalShopEnabled(): boolean {
  return parseBoolEnv(process.env.NEXT_PUBLIC_STUDENT_PORTAL_SHOP, false);
}

/** PIX funcional; quando `false`, layout placeholder permanece visível (**SPT-9**). */
export function isStudentPortalPaymentsPixEnabled(): boolean {
  return parseBoolEnv(process.env.NEXT_PUBLIC_STUDENT_PORTAL_PAYMENTS_PIX, false);
}
