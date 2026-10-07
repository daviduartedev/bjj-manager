import type { MonthFinanceSummary } from "@/lib/data/mensalidades-month-summary";
import type {
  PainelAttentionRow,
  PainelDistributionSlice,
} from "@/lib/data/painel-page";
import type { UpcomingSessionRow } from "@/lib/data/classes-page";
import type { PainelBillingMix } from "@/lib/painel/billing-mix";
import type { PainelBlockId } from "@/lib/painel/hidden-blocks";
import type { PaymentReminderRow } from "@/lib/painel/payment-reminders";

export type PainelDashboardProps = {
  displayName: string;
  hiddenBlocks: readonly PainelBlockId[];
  accountName: string;
  todayYmd: string;
  referenceMonth: string;
  activeStudentCount: number;
  overdueCount: number;
  graduationAlertCount: number;
  birthdayToday: PainelAttentionRow[];
  dueToday: PainelAttentionRow[];
  overdue14: PainelAttentionRow[];
  paymentReminders: PaymentReminderRow[];
  graduationAlerts: PainelAttentionRow[];
  distributionAdult: PainelDistributionSlice[];
  distributionKids: PainelDistributionSlice[];
  monthFinance: MonthFinanceSummary;
  forecastCents: number;
  billingMix: PainelBillingMix;
  todaySessions: UpcomingSessionRow[];
  nextSession: UpcomingSessionRow | null;
};
