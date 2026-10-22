import { createClient } from "@/lib/supabase/server";
import { dueDateInReferenceMonth } from "@/lib/billing/reference-month";
import { listUpcomingSessions, type UpcomingSessionRow } from "@/lib/data/classes-page";
import { loadMensalidadesRows } from "@/lib/data/mensalidades-page";
import type { MonthFinanceSummary } from "@/lib/data/mensalidades-month-summary";
import type { AcademyModality } from "@/lib/modalities/catalog";
import { isBirthdayThisCalendarMonth, isBirthdayToday } from "@/lib/painel/birthday-utils";
import { countBillingMix, type PainelBillingMix } from "@/lib/painel/billing-mix";
import { calendarDaysBetween, type GraduationRecordInput } from "@/lib/students/graduation-reference";
import {
  buildPaymentReminderRows,
  type PaymentReminderRow,
} from "@/lib/painel/payment-reminders";

import {
  buildPainelGraduationView,
  type PainelAttentionRow,
  type PainelDistributionSlice,
} from "./painel-graduation";

export type { PainelAttentionRow, PainelDistributionSlice };

type BeltEmbed = {
  id: string;
  slug: string;
  kind: "adult" | "kids";
  ordinal: number;
};

type StudentPainelRow = {
  id: string;
  full_name: string;
  phone: string | null;
  kind: "adult" | "kids" | "baby";
  birth_date: string | null;
  academy_start_date: string | null;
  current_belt_id: string | null;
  current_degree: number | null;
  graduation_reference_id: string | null;
  current_rank_code: string | null;
  current_rank_date: string | null;
  belts: BeltEmbed | BeltEmbed[] | null;
  student_graduations: GraduationRecordInput[] | null;
};

function unwrapBelt(b: BeltEmbed | BeltEmbed[] | null): BeltEmbed | null {
  if (b == null) return null;
  return Array.isArray(b) ? b[0] ?? null : b;
}

export async function loadPainelPageData(academyName: string, modality: AcademyModality): Promise<{
  todayYmd: string;
  referenceMonth: string;
  activeStudentCount: number;
  overdueCount: number;
  birthdayMonthCount: number;
  graduationAlertCount: number;
  birthdayToday: PainelAttentionRow[];
  dueToday: PainelAttentionRow[];
  overdue14: PainelAttentionRow[];
  paymentReminders: PaymentReminderRow[];
  graduationAlerts: PainelAttentionRow[];
  distributionAdult: PainelDistributionSlice[];
  distributionKids: PainelDistributionSlice[];
  monthFinance: MonthFinanceSummary;
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
        birth_date,
        academy_start_date,
        current_belt_id,
        current_degree,
        graduation_reference_id,
        current_rank_code,
        current_rank_date,
        belts!students_current_belt_id_fkey ( id, slug, kind, ordinal ),
        student_graduations ( resulting_belt_id, resulting_degree, graduated_at )
      `,
      )
      .eq("status", "active")
      .eq("is_exempt", false)
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

  const birthdayMonthCount = students.filter(
    (s) => isBirthdayThisCalendarMonth(s.birth_date, todayYmd),
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

  const graduation = buildPainelGraduationView(
    modality,
    todayYmd,
    students.map((student) => ({
      id: student.id,
      fullName: student.full_name,
      kind: student.kind,
      academyStartDate: student.academy_start_date,
      currentBelt: unwrapBelt(student.belts),
      currentDegree: student.current_degree,
      graduations: student.student_graduations ?? [],
      graduationReferenceId: student.graduation_reference_id,
      currentRankCode: student.current_rank_code,
      currentRankDate: student.current_rank_date,
    })),
  );
  const graduationAlerts = graduation.alerts;

  return {
    todayYmd,
    referenceMonth,
    activeStudentCount: students.length,
    overdueCount,
    birthdayMonthCount,
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
    distributionAdult: graduation.distributionAdult,
    distributionKids: graduation.distributionKids,
    monthFinance,
    billingMix: countBillingMix(
      billRows
        .filter((row) => activeIds.has(row.studentId))
        .map((row) => row.indicator),
    ),
    todaySessions: sessions.filter((session) => session.sessionDate === todayYmd),
    nextSession: sessions.find((session) => session.sessionDate > todayYmd) ?? null,
  };
}
