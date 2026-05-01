/**
 * Preço efetivo para cobrança (**BR-2.2**, **BLM-6**).
 */
export function getEffectivePrice(args: {
  customPriceCents: number | null | undefined;
  planPriceCents: number;
}): number {
  if (args.customPriceCents != null) return args.customPriceCents;
  return args.planPriceCents;
}
