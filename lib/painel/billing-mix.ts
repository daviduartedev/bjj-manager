import type { MonthBillingIndicator } from "@/lib/billing/month-billing-indicator";

/** Contagem da carteira do mês já carregada no painel. Isentos ficam de fora. */
export type PainelBillingMix = {
  paid: number;
  pending: number;
  overdue: number;
  scholarship: number;
  other: number;
};

export function countBillingMix(
  indicators: readonly MonthBillingIndicator[],
): PainelBillingMix {
  const mix: PainelBillingMix = {
    paid: 0,
    pending: 0,
    overdue: 0,
    scholarship: 0,
    other: 0,
  };
  for (const indicator of indicators) {
    if (indicator === "exempt") continue;
    mix[indicator] += 1;
  }
  return mix;
}
