import { formatMonthYearBr } from "@/lib/documents/templates/shared/format";
import { paymentReminderWhatsAppHref } from "@/lib/documents/whatsapp";

export type PaymentReminderSource = {
  studentId: string;
  fullName: string;
  phone: string | null;
};

export type PaymentReminderRow = {
  studentId: string;
  fullName: string;
  whatsappHref: string | null;
};

function firstName(fullName: string): string | null {
  const token = fullName.trim().split(/\s+/)[0];
  return token || null;
}

function monthLabel(referenceMonth: string): string {
  const iso = /^\d{4}-\d{2}$/.test(referenceMonth)
    ? `${referenceMonth}-01`
    : referenceMonth;
  return formatMonthYearBr(iso);
}

export const PAYMENT_REMINDER_PAGE_SIZE = 8;

export type PaymentReminderPhoneFilter = "all" | "whatsapp" | "no_phone";

export function filterPaymentReminderRows(
  rows: PaymentReminderRow[],
  args: { query: string; phone: PaymentReminderPhoneFilter },
): PaymentReminderRow[] {
  const q = args.query.trim().toLocaleLowerCase("pt-BR");
  return rows.filter((row) => {
    if (q && !row.fullName.toLocaleLowerCase("pt-BR").includes(q)) return false;
    if (args.phone === "whatsapp" && !row.whatsappHref) return false;
    if (args.phone === "no_phone" && row.whatsappHref) return false;
    return true;
  });
}

export function paginatePaymentReminderRows(
  rows: PaymentReminderRow[],
  page: number,
  pageSize = PAYMENT_REMINDER_PAGE_SIZE,
): {
  rows: PaymentReminderRow[];
  page: number;
  pageCount: number;
  total: number;
} {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total,
  };
}

export function buildPaymentReminderRows(
  overdue: PaymentReminderSource[],
  academyName: string,
  referenceMonth: string,
): PaymentReminderRow[] {
  const label = monthLabel(referenceMonth);
  return overdue.map((row) => ({
    studentId: row.studentId,
    fullName: row.fullName,
    whatsappHref: paymentReminderWhatsAppHref({
      phone: row.phone,
      studentFirstName: firstName(row.fullName),
      academyName,
      referenceMonthLabel: label,
    }),
  }));
}
