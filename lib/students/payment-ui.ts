export type PaymentStatusSlug =
  | "pending"
  | "paid"
  | "unpaid"
  | "scholarship"
  | "other";

export function paymentStatusLabelPt(status: PaymentStatusSlug): string {
  const map: Record<PaymentStatusSlug, string> = {
    pending: "Pendente",
    paid: "Pago",
    unpaid: "Não pago",
    scholarship: "Bolsista",
    other: "Outro",
  };
  return map[status] ?? status;
}

/** Dias no mês civil (1–12). */
export function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

/**
 * `reference_month` é sempre dia 1 (`YYYY-MM-01`). Devolve `YYYY-MM-DD` do vencimento naquele mês (BR-2.3).
 */
export function dueCalendarDateInMonth(
  referenceMonthFirstDay: string,
  dueDay: number,
): string | null {
  const m = /^(\d{4})-(\d{2})-01$/.exec(referenceMonthFirstDay.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!year || !month) return null;
  const last = daysInMonth(year, month);
  const day = Math.min(Math.max(1, dueDay), last);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * BR-4.3 / SPR-8.3 — complemento de UI (não persistido como estado próprio).
 */
export function isBillingOverdueUi(params: {
  referenceMonthFirstDay: string;
  dueDay: number;
  status: PaymentStatusSlug;
  todayYmd: string;
}): boolean {
  if (params.status === "paid" || params.status === "scholarship") return false;
  const due = dueCalendarDateInMonth(
    params.referenceMonthFirstDay,
    params.dueDay,
  );
  if (!due) return false;
  return params.todayYmd > due;
}

export function formatMoneyBrFromCents(cents: number | null | undefined): string {
  const n = cents ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n / 100);
}
