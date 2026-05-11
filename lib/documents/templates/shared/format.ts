import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function escapeHtml(value: string | null | undefined): string {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMoneyBrl(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDateBr(input: string | Date): string {
  const date = typeof input === "string" ? parseISO(input) : input;
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateTimeBr(input: string | Date): string {
  const date = typeof input === "string" ? parseISO(input) : input;
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatMonthYearBr(input: string | Date): string {
  const date = typeof input === "string" ? parseISO(input) : input;
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function formatCnpjMask(digits: string | null | undefined): string {
  if (!digits) return "";
  const d = digits.replace(/\D+/g, "");
  if (d.length !== 14) return d;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}
