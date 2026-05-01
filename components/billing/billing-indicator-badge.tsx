import type { MonthBillingIndicator } from "@/lib/billing/month-billing-indicator";
import { cn } from "@/lib/utils";

const LABEL: Record<MonthBillingIndicator, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
  scholarship: "Bolsista",
  other: "Outro",
};

function badgeClass(indicator: MonthBillingIndicator): string {
  switch (indicator) {
    case "paid":
      return "badge-paid";
    case "pending":
      return "badge-pending";
    case "overdue":
      return "badge-overdue";
    default:
      return "badge-info";
  }
}

export function BillingIndicatorBadge({
  indicator,
  className,
  compact,
}: {
  indicator: MonthBillingIndicator;
  className?: string;
  /** Lista densa: tipografia e padding mínimos. */
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        badgeClass(indicator),
        compact && "px-1.5 py-0 text-[10px] font-medium leading-tight",
        className,
      )}
    >
      {LABEL[indicator]}
    </span>
  );
}
