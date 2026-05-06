/** Ilustrações Unsplash (apenas visual na UI de stock). */

export type ProductImageKind = "shirt" | "gi" | "rash";

const UNSPLASH: Record<
  ProductImageKind,
  { src: string; alt: string; credit: string }
> = {
  shirt: {
    src: "https://images.unsplash.com/photo-1576566588028-4147f3840f27?auto=format&fit=crop&w=720&q=80",
    alt: "Camiseta básica em fundo neutro",
    credit: "Unsplash",
  },
  gi: {
    src: "https://images.unsplash.com/photo-1555597673-b21d5c935866?auto=format&fit=crop&w=720&q=80",
    alt: "Kimono / arte marcial",
    credit: "Unsplash",
  },
  rash: {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa245a?auto=format&fit=crop&w=720&q=80",
    alt: "Roupa de treino / compressão",
    credit: "Unsplash",
  },
};

export function resolveProductImageKind(code: string, name: string): ProductImageKind {
  const s = `${code} ${name}`.toLowerCase();
  if (s.includes("rash")) return "rash";
  if (
    s.includes("quimon") ||
    s.includes("kimono") ||
    s.includes("kmno") ||
    s.includes("zenshin")
  ) {
    return "gi";
  }
  if (s.includes("camiset") || s.includes("shirt") || s.includes("camisa")) {
    return "shirt";
  }
  return "shirt";
}

export function getProductHeroVisual(code: string, name: string) {
  const kind = resolveProductImageKind(code, name);
  return { kind, ...UNSPLASH[kind] };
}
