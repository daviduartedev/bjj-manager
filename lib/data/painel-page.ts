import { createClient } from "@/lib/supabase/server";
import { dueDateInReferenceMonth } from "@/lib/billing/reference-month";
import { loadMensalidadesRows } from "@/lib/data/mensalidades-page";
import { isBirthdayThisCalendarMonth, isBirthdayToday } from "@/lib/painel/birthday-utils";
import {
  calendarDaysBetween,
  meetsGraduationAttentionThreshold,
  resolveBeltStart,
  resolveDegreeStart,
  type GraduationRecordInput,
} from "@/lib/students/graduation-reference";
import { beltLabelPt } from "@/lib/students/belt-labels";

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

type StudentPainelRow = {
  id: string;
  full_name: string;
  kind: "adult" | "kids";
  birth_date: string | null;
  academy_start_date: string | null;
  current_belt_id: string;
  current_degree: number;
  belts: BeltEmbed | BeltEmbed[] | null;
  student_graduations: GraduationRecordInput[] | null;
};

function unwrapBelt(b: BeltEmbed | BeltEmbed[] | null): BeltEmbed | null {
  if (b == null) return null;
  return Array.isArray(b) ? b[0] ?? null : b;
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

export async function loadPainelPageData(): Promise<{
  todayYmd: string;
  referenceMonth: string;
  activeStudentCount: number;
  overdueCount: number;
  birthdayMonthCount: number;
  graduationAlertCount: number;
  birthdayToday: PainelAttentionRow[];
  dueToday: PainelAttentionRow[];
  overdue14: PainelAttentionRow[];
  graduationAlerts: PainelAttentionRow[];
  distributionAdult: PainelDistributionSlice[];
  distributionKids: PainelDistributionSlice[];
}> {
  const supabase = await createClient();

  const [mensalidades, studentsResult] = await Promise.all([
    loadMensalidadesRows(null),
    supabase
      .from("students")
      .select(
        `
        id,
        full_name,
        kind,
        birth_date,
        academy_start_date,
        current_belt_id,
        current_degree,
        belts!students_current_belt_id_fkey ( id, slug, kind, ordinal ),
        student_graduations ( resulting_belt_id, resulting_degree, graduated_at )
      `,
      )
      .eq("status", "active")
      .order("full_name", { ascending: true }),
  ]);

  if (studentsResult.error) throw studentsResult.error;

  const students = (studentsResult.data ?? []) as unknown as StudentPainelRow[];
  const activeIds = new Set(students.map((s) => s.id));

  const { referenceMonth, actualTodayYmd: todayYmd, rows: billRows } = mensalidades;

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
    birthdayMonthCount,
    graduationAlertCount: graduationAlerts.length,
    birthdayToday,
    dueToday,
    overdue14,
    graduationAlerts,
    distributionAdult: buildDistribution(students, "adult"),
    distributionKids: buildDistribution(students, "kids"),
  };
}
