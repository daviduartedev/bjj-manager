/** Imagens estáticas em `/public` por código de produto do seed / migração. */

export type ProductHeroVisual = {
  src: string;
  alt: string;
  credit: string;
};

/**
 * Resolve imagem do cartão (miniatura quadrada). Fallback: logo da marca.
 */
export function getProductHeroVisual(code: string, name: string): ProductHeroVisual {
  switch (code) {
    case "quimonos-kmno":
      return {
        src: "/kmno.webp",
        alt: "Kimono KMNO — linha azul",
        credit: "KMNO",
      };
    case "quimonos-zenshins":
      return {
        src: "/images.png",
        alt: "Kimono Zanshin — linha azul",
        credit: "Zanshin",
      };
    case "rash-guards-femininas":
    case "rash-guards-masculinas":
      return {
        src: "/products-rash-guard.png",
        alt: "Rash guard — manga curta ou longa",
        credit: "Referência",
      };
    case "academy-shirts":
      return {
        src: "/products-camiseta-academy.png",
        alt: "Camiseta da academia",
        credit: "Referência",
      };
    default:
      return {
        src: "/Logo.png",
        alt: name.trim() || "Produto",
        credit: "Catálogo",
      };
  }
}
