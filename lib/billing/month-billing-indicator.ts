import {
  compareIsoDateStrings,
  dueDateInReferenceMonth,
} from "./reference-month";

/** Indicador derivado para UI (**PBS-3**). */
export type MonthBillingIndicator =
  | "paid"
  | "pending"
  | "overdue"
  | "scholarship"
  | "other"
  | "exempt";

export type PaymentStatusSlug =
  | "pending"
  | "paid"
  | "unpaid"
  | "scholarship"
  | "other";

/**
 * Deriva o indicador do mês (**PBS-3**). `paymentStatus` é `null` quando não há linha em `payments`.
 */
export function getMonthBillingIndicator(args: {
  referenceMonthFirstDay: string;
  today: string;
  dueDay: number | null;
  paymentStatus: PaymentStatusSlug | null;
  isExempt?: boolean;
}): MonthBillingIndicator {
  if (args.isExempt === true) return "exempt";

  const { today, dueDay, paymentStatus } = args;

  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "scholarship") return "scholarship";
  if (paymentStatus === "other") return "other";

  if (dueDay === null) return "pending";

  const dueStr = dueDateInReferenceMonth(
    args.referenceMonthFirstDay,
    dueDay,
  );
  if (!dueStr) return "pending";

  const cmp = compareIsoDateStrings(today, dueStr);
  if (cmp <= 0) return "pending";
  return "overdue";
}
