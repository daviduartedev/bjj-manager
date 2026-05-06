/**
 * Catálogo inicial de produtos por conta (espelha seed/migração SQL).
 * `code` é estável; o nome pode ser editado na UI.
 */
export const INITIAL_PRODUCT_DEFINITIONS = [
  { code: "academy-shirts", name: "Camisetas da academia", sortOrder: 10 },
  { code: "rash-guards-femininas", name: "Rash Guards femininas", sortOrder: 20 },
  { code: "rash-guards-masculinas", name: "Rash Guards masculinas", sortOrder: 30 },
  { code: "quimonos-kmno", name: "Quimonos KMNO", sortOrder: 40 },
  { code: "quimonos-zenshins", name: "Quimonos Zenshins", sortOrder: 50 },
] as const;

/** Tamanhos iniciais só para camisetas da academia. */
export const INITIAL_ACADEMY_SHIRT_SIZES = [
  { label: "P", sortOrder: 10 },
  { label: "M", sortOrder: 20 },
  { label: "G", sortOrder: 30 },
  { label: "GG", sortOrder: 40 },
] as const;
