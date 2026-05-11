import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatMoneyBrFromCents } from "@/lib/students/payment-ui";

export { formatMoneyBrFromCents };

export function formatDateTimeBR(input: string | Date): string {
  const date = typeof input === "string" ? parseISO(input) : input;
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatDateBRShort(input: string | Date): string {
  const date = typeof input === "string" ? parseISO(input) : input;
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}
