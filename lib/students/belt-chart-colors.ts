/**
 * Cores das barras da distribuição por faixa no painel (**PNL-6**).
 * Até existir `belts.color_hex` na BD, usa-se paleta estável por slug (**GR-1** / seed).
 */
export function beltDistributionBarColor(slug: string, kind: "adult" | "kids"): string {
  const adult: Record<string, string> = {
    white: "#e5e7eb",
    blue: "#2563eb",
    purple: "#7c3aed",
    brown: "#92400e",
    black: "#0a0a0a",
  };

  const kids: Record<string, string> = {
    white_kids: "#e5e7eb",
    white: "#e5e7eb",
    gray_white: "#9ca3af",
    gray: "#6b7280",
    gray_black: "#374151",
    yellow_white: "#fde047",
    yellow: "#eab308",
    yellow_black: "#ca8a04",
    orange_white: "#fdba74",
    orange: "#ea580c",
    orange_black: "#c2410c",
    green_white: "#86efac",
    green: "#16a34a",
    green_black: "#15803d",
  };

  const map = kind === "adult" ? adult : kids;
  return map[slug] ?? (kind === "adult" ? "#64748b" : "#94a3b8");
}
