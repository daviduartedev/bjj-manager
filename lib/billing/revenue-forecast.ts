import { getEffectivePrice } from "@/lib/billing/get-effective-price";
import type { PaymentStatusSlug } from "@/lib/billing/month-billing-indicator";
import {
  isStudentInMonthlyOperationalWallet,
  type MonthlyOperationalWalletFields,
} from "@/lib/students/monthly-operational-wallet";

export type PieSlices =
  | { kind: "empty"; pct: 0; remaining: 0; over: false }
  | { kind: "full"; pct: 100; remaining: 0; over: boolean }
  | { kind: "split"; pct: number; remaining: number; over: false };

export type RevenueForecastStudent = MonthlyOperationalWalletFields & {
  openPlan: {
    customPriceCents: number | null | undefined;
    planPriceCents: number;
  } | null;
  monthPaymentStatus: PaymentStatusSlug | null;
};

export function pieSlices(forecast: number, received: number): PieSlices {
  if (forecast <= 0) return { kind: "empty", pct: 0, remaining: 0, over: false };
  if (received >= forecast) {
    return { kind: "full", pct: 100, remaining: 0, over: received > forecast };
  }
  const pct = Math.round((received / forecast) * 100);
  return { kind: "split", pct, remaining: forecast - received, over: false };
}

/**
 * Previsão de receita mensal: soma do preço efectivo dos alunos na carteira
 * operacional com vínculo aberto, excluindo bolsista daquele mês.
 */
export function sumMonthlyRevenueForecast(students: readonly RevenueForecastStudent[]): number {
  let total = 0;
  for (const row of students) {
    if (!isStudentInMonthlyOperationalWallet(row)) continue;
    if (!row.openPlan) continue;
    if (row.monthPaymentStatus === "scholarship") continue;
    total += getEffectivePrice({
      customPriceCents: row.openPlan.customPriceCents,
      planPriceCents: row.openPlan.planPriceCents,
    });
  }
  return total;
}
