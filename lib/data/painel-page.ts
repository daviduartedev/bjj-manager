import { createClient } from "@/lib/supabase/server";
import type { PaymentStatusSlug } from "@/lib/billing/month-billing-indicator";
import { dueDateInReferenceMonth } from "@/lib/billing/reference-month";
import {
  sumMonthlyRevenueForecast,
  type RevenueForecastStudent,
} from "@/lib/billing/revenue-forecast";
import { listUpcomingSessions, type UpcomingSessionRow } from "@/lib/data/classes-page";
import { loadMensalidadesRows } from "@/lib/data/mensalidades-page";
import type { MonthFinanceSummary } from "@/lib/data/mensalidades-month-summary";
import { isBirthdayToday } from "@/lib/painel/birthday-utils";
import { countBillingMix, type PainelBillingMix } from "@/lib/painel/billing-mix";
import {
  calendarDaysBetween,
  meetsGraduationAttentionThreshold,
  resolveBeltStart,
  resolveDegreeStart,
  type GraduationRecordInput,
} from "@/lib/students/graduation-reference";
import { beltLabelPt } from "@/lib/students/belt-labels";
import {
  buildPaymentReminderRows,
  type PaymentReminderRow,
} from "@/lib/painel/payment-reminders";

export type PainelAttentionRow = {
  studentId: string;
  fullName: string;
};

export type PainelDistributionSlice = {
  beltId: string;
  slug: string;
  kind: "adult" | "kids";
  ordinal: number;
  label: string;
  count: number;
};

type BeltEmbed = {
  id: string;
  slug: string;
  kind: "adult" | "kids";
  ordinal: number;
};

type PlanPriceEmbed = { price_cents: number | null } | { price_cents: number | null }[] | null;

type StudentPlanEmbed = {
  custom_price_cents: number | null;
  ended_at: string | null;
  plans: PlanPriceEmbed;
};

type PaymentEmbed = {
  status: string;
  reference_month: string;
};

type StudentPainelRow = {
  id: string;
  full_name: string;
  phone: string | null;
  kind: "adult" | "kids";
  status: string;
  is_exempt: boolean | null;
  archived_at: string | null;
  removed_at: string | null;
  birth_date: string | null;
  academy_start_date: string | null;
  current_belt_id: string;
  current_degree: number;
  belts: BeltEmbed | BeltEmbed[] | null;
  student_graduations: GraduationRecordInput[] | null;
  student_plans: StudentPlanEmbed[] | null;
  payments: PaymentEmbed[] | null;
};

function unwrapBelt(b: BeltEmbed | BeltEmbed[] | null): BeltEmbed | null {
  if (b == null) return null;
  return Array.isArray(b) ? b[0] ?? null : b;
}

function unwrapPlanPrice(plans: PlanPriceEmbed): { price_cents: number | null } | null {
  if (plans == null) return null;
  return Array.isArray(plans) ? plans[0] ?? null : plans;
}

function asPaymentStatus(status: string | undefined): PaymentStatusSlug | null {
  if (
    status === "pending" ||
    status === "paid" ||
    status === "unpaid" ||
    status === "scholarship" ||
    status === "other"
  ) {
    return status;
  }
  return null;
}

function toRevenueForecastStudent(
  row: StudentPainelRow,
  referenceMonth: string,
): RevenueForecastStudent {
  const open = row.student_plans?.find((plan) => plan.ended_at == null) ?? null;
  const plan = unwrapPlanPrice(open?.plans ?? null);
  const payment = row.payments?.find((p) => p.reference_month === referenceMonth);
  return {
    status: row.status,
    is_exempt: row.is_exempt === true,
    archived_at: row.archived_at,
    removed_at: row.removed_at,
    openPlan:
      open && plan
        ? {
            customPriceCents: open.custom_price_cents,
            planPriceCents: plan.price_cents ?? 0,
          }
        : null,
    monthPaymentStatus: asPaymentStatus(payment?.status),
  };
}

function buildDistribution(
  students: StudentPainelRow[],
  kind: "adult" | "kids",
): PainelDistributionSlice[] {
  const map = new Map<
    string,
    { belt: BeltEmbed; count: number }
  >();
  for (const s of students) {
    if (s.kind !== kind) continue;
    const belt = unwrapBelt(s.belts);
    if (!belt) continue;
    const prev = map.get(belt.id);
    if (prev) prev.count += 1;
    else map.set(belt.id, { belt, count: 1 });
  }
  const slices: PainelDistributionSlice[] = [];
  for (const { belt, count } of map.values()) {
    slices.push({
      beltId: belt.id,
      slug: belt.slug,
      kind: belt.kind,
      ordinal: belt.ordinal,
      label: beltLabelPt(belt.slug, belt.kind),
      count,
    });
  }
  slices.sort((a, b) => a.ordinal - b.ordinal);
  return slices;
}

export async function loadPainelPageData(academyName: string): Promise<{
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
}> {
  const supabase = await createClient();

  const [mensalidades, studentsResult, sessions] = await Promise.all([
    loadMensalidadesRows(null),
    supabase
      .from("students")
      .select(
        `
        id,
        full_name,
        phone,
        kind,
        status,
        is_exempt,
        archived_at,
        removed_at,
        birth_date,
        academy_start_date,
        current_belt_id,
        current_degree,
        belts!students_current_belt_id_fkey ( id, slug, kind, ordinal ),
        student_graduations ( resulting_belt_id, resulting_degree, graduated_at ),
        student_plans ( custom_price_cents, ended_at, plans ( price_cents ) ),
        payments ( status, reference_month )
      `,
      )
      .eq("status", "active")
      .is("archived_at", null)
      .is("removed_at", null)
      .order("full_name", { ascending: true }),
    listUpcomingSessions(),
  ]);

  if (studentsResult.error) throw studentsResult.error;

  const students = (studentsResult.data ?? []) as unknown as StudentPainelRow[];
  const activeIds = new Set(students.map((s) => s.id));

  const { referenceMonth, actualTodayYmd: todayYmd, rows: billRows, monthFinance } =
    mensalidades;

  const overdueCount = billRows.filter(
    (r) => r.indicator === "overdue" && activeIds.has(r.studentId),
  ).length;

  const nameById = new Map(students.map((s) => [s.id, s.full_name] as const));

  const birthdayToday: PainelAttentionRow[] = [];
  for (const s of students) {
    if (!isBirthdayToday(s.birth_date, todayYmd)) continue;
    birthdayToday.push({ studentId: s.id, fullName: s.full_name });
  }

  const dueToday: PainelAttentionRow[] = [];
  const overdue14: PainelAttentionRow[] = [];

  for (const row of billRows) {
    if (!activeIds.has(row.studentId)) continue;
    if (row.dueDay == null) continue;
    const dueStr = dueDateInReferenceMonth(referenceMonth, row.dueDay);
    if (!dueStr) continue;
    const name = nameById.get(row.studentId) ?? "";
    if (dueStr === todayYmd && (row.indicator === "pending" || row.indicator === "overdue")) {
      dueToday.push({ studentId: row.studentId, fullName: name });
    }
    if (row.indicator === "overdue") {
      const late = calendarDaysBetween(dueStr, todayYmd);
      if (late !== null && late >= 14) {
        overdue14.push({ studentId: row.studentId, fullName: name });
      }
    }
  }

  const graduationAlerts: PainelAttentionRow[] = [];
  for (const s of students) {
    const grads = (s.student_graduations ?? []) as GraduationRecordInput[];
    const beltR = resolveBeltStart(grads, s.current_belt_id, s.academy_start_date);
    const degR = resolveDegreeStart(
      grads,
      s.current_belt_id,
      s.current_degree,
      s.academy_start_date,
    );
    if (
      meetsGraduationAttentionThreshold(beltR.startYmd, degR.startYmd, todayYmd)
    ) {
      graduationAlerts.push({ studentId: s.id, fullName: s.full_name });
    }
  }

  return {
    todayYmd,
    referenceMonth,
    activeStudentCount: students.length,
    overdueCount,
    graduationAlertCount: graduationAlerts.length,
    birthdayToday,
    dueToday,
    overdue14,
    paymentReminders: buildPaymentReminderRows(
      billRows
        .filter((r) => r.indicator === "overdue" && activeIds.has(r.studentId))
        .map((r) => {
          const student = students.find((s) => s.id === r.studentId);
          return {
            studentId: r.studentId,
            fullName: nameById.get(r.studentId) ?? "",
            phone: student?.phone ?? null,
          };
        }),
      academyName,
      referenceMonth,
    ),
    graduationAlerts,
    distributionAdult: buildDistribution(students, "adult"),
    distributionKids: buildDistribution(students, "kids"),
    monthFinance,
    forecastCents: sumMonthlyRevenueForecast(
      students.map((row) => toRevenueForecastStudent(row, referenceMonth)),
    ),
    billingMix: countBillingMix(
      billRows
        .filter((row) => activeIds.has(row.studentId))
        .map((row) => row.indicator),
    ),
    todaySessions: sessions.filter((session) => session.sessionDate === todayYmd),
    nextSession: sessions.find((session) => session.sessionDate > todayYmd) ?? null,
  };
}
