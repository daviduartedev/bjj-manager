/** Faixa etária da turma Baby (4–8 anos). */
export const BABY_MIN_AGE_YEARS = 4;
export const BABY_MAX_AGE_YEARS = 8;

export function isBabyAge(ageYears: number | null | undefined): boolean {
  if (ageYears == null) return false;
  return ageYears >= BABY_MIN_AGE_YEARS && ageYears <= BABY_MAX_AGE_YEARS;
}
