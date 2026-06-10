export function formatWeightKgPt(
  weightKg: number | null | undefined,
): string | null {
  if (weightKg == null || !Number.isFinite(weightKg)) return null;
  return `${weightKg.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} kg`;
}
