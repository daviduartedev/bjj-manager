import { billingComparisonDateIso } from "@/lib/billing/reference-month";
import { normalizeReferenceMonth } from "@/lib/billing/reference-month";
import { fetchMonthBillingSnapshots } from "@/lib/billing/month-billing-snapshots";
import type { MonthBillingSnapshot } from "@/lib/billing/month-billing-snapshots";
import { createClient } from "@/lib/supabase/server";
import { toCalendarDateStringInAppTZ } from "@/lib/dates";
import type { PaymentStatusSlug } from "@/lib/students/payment-ui";
import type { PlanKind } from "@/lib/students/plan-kind";

export type DetailPaymentRow = {
  id: string;
  reference_month: string;
  status: PaymentStatusSlug;
  amount_cents: number | null;
  paid_at: string | null;
  notes: string | null;
  payment_method: string | null;
};

export type MensalidadesDetailPayload = {
  studentId: string;
  fullName: string;
  referenceMonth: string;
  actualTodayYmd: string;
  planLabel: string | null;
  dueDay: number | null;
  amountCentsExpected: number | null;
  snapshot: MonthBillingSnapshot | null;
  payments: DetailPaymentRow[];
};

export async function loadMensalidadesDetail(
  studentId: string,
  referenceMonthInput: string | null,
): Promise<MensalidadesDetailPayload | null> {
  const supabase = await createClient();
  const actualTodayYmd = toCalendarDateStringInAppTZ(new Date());
  const defaultMonth = `${actualTodayYmd.slice(0, 7)}-01`;
  const referenceMonth =
    normalizeReferenceMonth(referenceMonthInput ?? defaultMonth) ?? defaultMonth;

  const comparisonToday = billingComparisonDateIso(referenceMonth, actualTodayYmd);

  const { data: st, error: stErr } = await supabase
    .from("students")
    .select(
      `
      id,
      full_name,
      student_plans (
        due_day,
        ended_at,
        plans ( name, kind )
      ),
      payments (
        id,
        reference_month,
        status,
        amount_cents,
        paid_at,
        notes,
        payment_method
      )
    `,
    )
    .eq("id", studentId)
    .maybeSingle();

  if (stErr || !st) return null;

  const snaps = await fetchMonthBillingSnapshots({
    supabase,
    studentIds: [studentId],
    referenceMonthFirstDay: referenceMonth,
    today: comparisonToday,
  });
  const snapshot = snaps[0] ?? null;

  const spArr = st.student_plans as unknown as
    | {
        due_day: number;
        ended_at: string | null;
        plans: { name: string; kind: PlanKind } | { name: string; kind: PlanKind }[] | null;
      }[]
    | null;
  const open = spArr?.find((r) => r.ended_at == null);
  const planEmbed = Array.isArray(open?.plans) ? open?.plans[0] : open?.plans;

  const paymentsRaw = (st.payments ?? []) as unknown as DetailPaymentRow[];
  const payments = [...paymentsRaw].sort((a, b) =>
    a.reference_month < b.reference_month ? 1 : a.reference_month > b.reference_month ? -1 : 0,
  );

  return {
    studentId: st.id as string,
    fullName: st.full_name as string,
    referenceMonth,
    actualTodayYmd,
    planLabel: planEmbed?.name ?? null,
    dueDay: open?.due_day ?? null,
    amountCentsExpected: snapshot?.amountCentsExpected ?? null,
    snapshot,
    payments,
  };
}
