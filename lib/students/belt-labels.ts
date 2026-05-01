/** Rótulos pt-BR para slugs de faixa (seed + **GR-1** / **GR-2**). */
const ADULT: Record<string, string> = {
  white: "Branca",
  blue: "Azul",
  purple: "Roxa",
  brown: "Marrom",
  black: "Preta",
};

const KIDS: Record<string, string> = {
  white: "Branca",
  gray_white: "Cinza/Branca",
  gray: "Cinza",
  gray_black: "Cinza/Preta",
  yellow_white: "Amarela/Branca",
  yellow: "Amarela",
  yellow_black: "Amarela/Preta",
  orange_white: "Laranja/Branca",
  orange: "Laranja",
  orange_black: "Laranja/Preta",
  green_white: "Verde/Branca",
  green: "Verde",
  green_black: "Verde/Preta",
};

export function beltLabelPt(slug: string, kind: "adult" | "kids"): string {
  const map = kind === "adult" ? ADULT : KIDS;
  return map[slug] ?? slug;
}
