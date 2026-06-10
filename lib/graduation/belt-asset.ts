import { isValidDegreeForBelt } from "@/lib/students/degree";

/** Normaliza grau para o asset PNG existente (0–4 coloridas/kids; 0–6 preta). */
export function clampDegreeForBeltAsset(
  slug: string,
  kind: "adult" | "kids",
  degree: number,
): number {
  if (!Number.isFinite(degree)) return 0;
  const d = Math.max(0, Math.round(degree));
  if (kind === "adult" && slug === "black") {
    return Math.min(6, d);
  }
  if (isValidDegreeForBelt(slug, kind, d)) return d;
  return Math.min(4, Math.max(0, d));
}

/**
 * Caminho público do PNG em `public/belts/`.
 * Convenção: `{kind}-{slug com hífens}_degree_{N}.png`
 */
export function beltAssetPath(
  slug: string,
  kind: "adult" | "kids",
  degree: number,
): string {
  const d = clampDegreeForBeltAsset(slug, kind, degree);
  const slugFile = slug.replace(/_/g, "-");
  return `/belts/${kind}-${slugFile}_degree_${d}.png`;
}
