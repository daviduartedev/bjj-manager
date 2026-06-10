/** Cores aproximadas por slug para ilustração (sem color_hex na BD). */
const ADULT_HEX: Record<string, string> = {
  white: "#f5f5f4",
  blue: "#1d4ed8",
  purple: "#6b21a8",
  brown: "#78350f",
  black: "#171717",
};

const KIDS_PRIMARY: Record<string, string> = {
  white: "#f5f5f4",
  white_kids: "#f5f5f4",
  gray_white: "#9ca3af",
  gray: "#6b7280",
  gray_black: "#374151",
  yellow_white: "#facc15",
  yellow: "#eab308",
  yellow_black: "#ca8a04",
  orange_white: "#fb923c",
  orange: "#f97316",
  orange_black: "#ea580c",
  green_white: "#4ade80",
  green: "#22c55e",
  green_black: "#16a34a",
};

const KIDS_SECONDARY: Partial<Record<string, string>> = {
  gray_white: "#f5f5f4",
  gray_black: "#171717",
  yellow_white: "#f5f5f4",
  yellow_black: "#171717",
  orange_white: "#f5f5f4",
  orange_black: "#171717",
  green_white: "#f5f5f4",
  green_black: "#171717",
};

export type BeltVisual = {
  primary: string;
  secondary?: string;
  isKids: boolean;
};

export function beltVisualForSlug(
  slug: string,
  kind: "adult" | "kids",
): BeltVisual {
  if (kind === "adult") {
    return {
      primary: ADULT_HEX[slug] ?? "#64748b",
      isKids: false,
    };
  }
  return {
    primary: KIDS_PRIMARY[slug] ?? "#64748b",
    secondary: KIDS_SECONDARY[slug],
    isKids: true,
  };
}
