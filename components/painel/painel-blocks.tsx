import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";

export function formatPainelDate(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  if (!year || !month || !day) return ymd;
  const raw = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatPainelMonth(referenceMonth: string): string {
  const [year, month] = referenceMonth.split("-").map(Number);
  if (!year || !month) return referenceMonth;
  const raw = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function moneyLabel(cents: number): string {
  return formatMoneyBrFromCents(cents);
}
