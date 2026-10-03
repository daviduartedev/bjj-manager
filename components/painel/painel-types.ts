import type { MonthFinanceSummary } from "@/lib/data/mensalidades-month-summary";
import type {
  PainelAttentionRow,
  PainelDistributionSlice,
} from "@/lib/data/painel-page";
import type { UpcomingSessionRow } from "@/lib/data/classes-page";
import type { PainelBillingMix } from "@/lib/painel/billing-mix";

export type PainelDashboardProps = {
  displayName: string;
  accountName: string;
  todayYmd: string;
  referenceMonth: string;
  activeStudentCount: number;
  overdueCount: number;
  graduationAlertCount: number;
  birthdayToday: PainelAttentionRow[];
  dueToday: PainelAttentionRow[];
  overdue14: PainelAttentionRow[];
  graduationAlerts: PainelAttentionRow[];
  distributionAdult: PainelDistributionSlice[];
  distributionKids: PainelDistributionSlice[];
  monthFinance: MonthFinanceSummary;
  billingMix: PainelBillingMix;
  todaySessions: UpcomingSessionRow[];
  nextSession: UpcomingSessionRow | null;
};
