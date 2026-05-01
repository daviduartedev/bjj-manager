/** Centavos de referência (**BLM-2** / **BR-1.4**). */
export const DEFAULT_PLAN_PRICE_CENTS = {
  kids_1: 10_000,
  kids_2: 12_000,
  adult: 12_000,
} as const;

export const DEFAULT_PLAN_ROWS = [
  { kind: "kids_1" as const, name: "Kid 1", price_cents: DEFAULT_PLAN_PRICE_CENTS.kids_1 },
  { kind: "kids_2" as const, name: "Juvenil", price_cents: DEFAULT_PLAN_PRICE_CENTS.kids_2 },
  { kind: "adult" as const, name: "Adulto", price_cents: DEFAULT_PLAN_PRICE_CENTS.adult },
];
