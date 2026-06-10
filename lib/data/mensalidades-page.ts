import {
  billingComparisonDateIso,
  normalizeReferenceMonth,
} from "@/lib/billing/reference-month";
import { fetchMonthBillingSnapshots } from "@/lib/billing/month-billing-snapshots";
import type { MonthBillingIndicator } from "@/lib/billing/month-billing-indicator";
import {
  loadMonthFinanceSummary,
  type MonthFinanceSummary,
} from "@/lib/data/mensalidades-month-summary";
import { createClient } from "@/lib/supabase/server";
import { toCalendarDateStringInAppTZ } from "@/lib/dates";
import type { StudentKind } from "@/lib/students/degree";
import type { PlanKind } from "@/lib/students/plan-kind";

export type { MonthFinanceSummary };

export type MensalidadesStudentRow = {
  studentId: string;
  /** Faixa etária do aluno (coluna `students.kind` ou derivada do plano). */
  kind: StudentKind;
  /** `plans.kind` do vínculo aberto; filtro «Plano» na lista. */
  planKind: PlanKind | null;
  fullName: string;
  planLabel: string | null;
  dueDay: number | null;
  amountCentsExpected: number | null;
  indicator: MonthBillingIndicator;
  paymentId: string | null;
};

function resolveStudentKind(
  studentKind: unknown,
  planKind: PlanKind | null,
): StudentKind {
  if (studentKind === "adult" || studentKind === "kids") return studentKind;
  if (planKind === "adult") return "adult";
  if (planKind === "kids_1" || planKind === "kids_2") return "kids";
  return "adult";
}

export async function loadMensalidadesRows(referenceMonthInput: string | null): Promise<{
  referenceMonth: string;
  actualTodayYmd: string;
  rows: MensalidadesStudentRow[];
  monthFinance: MonthFinanceSummary;
}> {
  const supabase = await createClient();
  const actualTodayYmd = toCalendarDateStringInAppTZ(new Date());
  const defaultMonth = `${actualTodayYmd.slice(0, 7)}-01`;
  const referenceMonth =
    normalizeReferenceMonth(referenceMonthInput ?? defaultMonth) ?? defaultMonth;

  const comparisonToday = billingComparisonDateIso(referenceMonth, actualTodayYmd);

  const [{ data: students, error }, monthFinance] = await Promise.all([
    supabase
      .from("students")
      .select(
        `
      id,
      kind,
      full_name,
      student_plans ( plan_id, due_day, ended_at, plans ( name, kind ) )
    `,
      )
      .eq("status", "active")
      .eq("is_exempt", false)
      .is("archived_at", null)
      .is("removed_at", null)
      .order("full_name", { ascending: true }),
    loadMonthFinanceSummary(supabase, referenceMonth),
  ]);

  if (error) throw error;

  const studentIds = (students ?? []).map((s) => s.id as string);
  const snapshots = await fetchMonthBillingSnapshots({
    supabase,
    studentIds,
    referenceMonthFirstDay: referenceMonth,
    today: comparisonToday,
  });

  const snapById = new Map(snapshots.map((s) => [s.studentId, s]));

  const rows: MensalidadesStudentRow[] = (students ?? []).map((raw) => {
    const id = raw.id as string;
    const spArr = raw.student_plans as unknown as
      | {
          plan_id: string;
          due_day: number;
          ended_at: string | null;
          plans: { name: string; kind: PlanKind } | { name: string; kind: PlanKind }[] | null;
        }[]
      | null;
    const open = spArr?.find((s) => s.ended_at == null);
    const planEmbed = Array.isArray(open?.plans) ? open?.plans[0] : open?.plans;
    const planLabel = planEmbed?.name ?? null;
    const planKind = planEmbed?.kind ?? null;
    const rowKind = resolveStudentKind(raw.kind, planKind);

    const snap = snapById.get(id);
    if (!snap) {
      return {
        studentId: id,
        kind: rowKind,
        planKind,
        fullName: raw.full_name as string,
        planLabel,
        dueDay: null,
        amountCentsExpected: null,
        indicator: "pending",
        paymentId: null,
      };
    }

    return {
      studentId: id,
      kind: rowKind,
      planKind,
      fullName: raw.full_name as string,
      planLabel,
      dueDay: snap.dueDay,
      amountCentsExpected: snap.amountCentsExpected,
      indicator: snap.indicator,
      paymentId: snap.paymentId,
    };
  });

  return { referenceMonth, actualTodayYmd, rows, monthFinance };
}
