export type StudentKind = "adult" | "kids";
export type BeltKind = "adult" | "kids";

/** **GR-1.3** / **GR-1.4** / **GR-2.2**, limites de grau por faixa. */
export function isValidDegreeForBelt(
  beltSlug: string,
  beltKind: BeltKind,
  degree: number,
): boolean {
  if (!Number.isInteger(degree) || degree < 0 || degree > 6) return false;
  if (beltKind === "adult" && beltSlug === "black") {
    return degree >= 0 && degree <= 6;
  }
  if (beltKind === "adult" || beltKind === "kids") {
    return degree >= 0 && degree <= 4;
  }
  return false;
}

export function degreeOptionsForBelt(
  beltSlug: string,
  beltKind: BeltKind,
): number[] {
  if (beltKind === "adult" && beltSlug === "black") {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  return [0, 1, 2, 3, 4];
}
