import type { createClient } from "@/lib/supabase/server";

import { getEffectivePrice } from "./get-effective-price";
import {
  type MonthBillingIndicator,
  type PaymentStatusSlug,
  getMonthBillingIndicator,
} from "./month-billing-indicator";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

type PlanRow = { price_cents: number | null } | null;

type StudentPlanRow = {
  due_day: number;
  custom_price_cents: number | null;
  ended_at: string | null;
  plans: PlanRow | PlanRow[];
};

type PaymentRow = {
  id: string;
  status: string;
  amount_cents: number | null;
  reference_month: string;
};

export type MonthBillingSnapshot = {
  studentId: string;
  referenceMonth: string;
  dueDay: number | null;
  amountCentsExpected: number | null;
  persistedStatus: PaymentStatusSlug | null;
  indicator: MonthBillingIndicator;
  paymentId: string | null;
};

function unwrapPlan(plans: PlanRow | PlanRow[]): PlanRow {
  if (plans == null) return null;
  return Array.isArray(plans) ? plans[0] ?? null : plans;
}

function pickOpenPlan(rows: StudentPlanRow[] | null): StudentPlanRow | null {
  if (!rows?.length) return null;
  const open = rows.filter((r) => r.ended_at == null);
  return open[0] ?? null;
}

/**
 * Uma leitura agregada por aluno para o mês (**PBS-6**). Filtra `payments` pelo `referenceMonth` em memória.
 */
export async function fetchMonthBillingSnapshots(args: {
  supabase: SupabaseServer;
  studentIds: string[];
  referenceMonthFirstDay: string;
  today: string;
}): Promise<MonthBillingSnapshot[]> {
  const { supabase, studentIds, referenceMonthFirstDay, today } = args;
  if (studentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("students")
    .select(
      `
      id,
      student_plans (
        due_day,
        custom_price_cents,
        ended_at,
        plans ( price_cents )
      ),
      payments (
        id,
        status,
        amount_cents,
        reference_month
      )
    `,
    )
    .in("id", studentIds);

  if (error) throw error;
  if (!data?.length) return [];

  return data.map((row) => {
    const studentId = row.id as string;
    const planRows = row.student_plans as StudentPlanRow[] | null;
    const open = pickOpenPlan(planRows);
    const plan = unwrapPlan(open?.plans ?? null);
    const dueDay = open?.due_day ?? null;

    const amountCentsExpected =
      open && plan
        ? getEffectivePrice({
            customPriceCents: open.custom_price_cents,
            planPriceCents: plan.price_cents ?? 0,
          })
        : null;

    const payments = (row.payments as PaymentRow[] | null) ?? [];
    const paymentForMonth = payments.find(
      (p) => p.reference_month === referenceMonthFirstDay,
    );

    const persistedStatus = paymentForMonth
      ? (paymentForMonth.status as PaymentStatusSlug)
      : null;

    const indicator = getMonthBillingIndicator({
      referenceMonthFirstDay,
      today,
      dueDay,
      paymentStatus: persistedStatus,
    });

    return {
      studentId,
      referenceMonth: referenceMonthFirstDay,
      dueDay,
      amountCentsExpected,
      persistedStatus,
      indicator,
      paymentId: paymentForMonth?.id ?? null,
    };
  });
}
