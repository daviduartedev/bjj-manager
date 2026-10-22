/** Modalidade da academia; público, plano e tipo de turma continuam conceitos distintos. */
export const ACADEMY_MODALITIES = ["jiu_jitsu", "boxing", "muay_thai", "judo"] as const;
export type AcademyModality = (typeof ACADEMY_MODALITIES)[number];

export const MODALITY_LABELS: Record<AcademyModality, string> = {
  jiu_jitsu: "Jiu-Jitsu",
  boxing: "Boxe",
  muay_thai: "Muay Thai",
  judo: "Judô",
};

export function isAcademyModality(value: unknown): value is AcademyModality {
  return ACADEMY_MODALITIES.some((modality) => modality === value);
}
