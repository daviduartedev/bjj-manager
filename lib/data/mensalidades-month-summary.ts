import type { createClient } from "@/lib/supabase/server";

import { isStudentInMonthlyOperationalWallet } from "@/lib/students/monthly-operational-wallet";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export type MonthFinanceSummary = {
  referenceMonth: string;
  /** Soma de `amount_cents` com status `paid` (entrada de caixa registada). */
  totalPaidReceivedCents: number;
  /** Linhas com status `paid`. */
  paidCount: number;
  /** Isenções / bolsista no mês. */
  scholarshipCount: number;
  /** Status “outro” no mês. */
  otherCount: number;
  /** Repartição do valor pago pelo nome do plano actual do aluno (vínculo aberto). */
  paidByPlanLabel: { planLabel: string; totalCents: number }[];
};

type PlanEmbed = { name: string } | { name: string }[] | null;

type StudentPlanEmbed = {
  ended_at: string | null;
  plans: PlanEmbed;
};

type StudentEmbed = {
  status?: string;
  is_exempt?: boolean | null;
  archived_at?: string | null;
  removed_at?: string | null;
  student_plans?: StudentPlanEmbed[] | null;
};

function openPlanLabel(student: StudentEmbed | null | undefined): string {
  const rows = student?.student_plans;
  if (!rows?.length) return "Sem plano";
  const open = rows.find((r) => r.ended_at == null);
  const pl = open?.plans;
  const name = Array.isArray(pl) ? pl[0]?.name : pl?.name;
  return name?.trim() ? name : "Sem plano";
}

/**
 * Agrega registos em `payments` para o mês civil (**BRL** em centavos).
 * RLS limita à conta via `student_id` → aluno da academia.
 */
export async function loadMonthFinanceSummary(
  supabase: SupabaseServer,
  referenceMonthFirstDay: string,
): Promise<MonthFinanceSummary> {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      amount_cents,
      status,
      students (
        status,
        is_exempt,
        archived_at,
        removed_at,
        student_plans (
          ended_at,
          plans ( name )
        )
      )
    `,
    )
    .eq("reference_month", referenceMonthFirstDay);

  if (error) throw error;

  let totalPaidReceivedCents = 0;
  let paidCount = 0;
  let scholarshipCount = 0;
  let otherCount = 0;
  const byPlan = new Map<string, number>();

  for (const row of data ?? []) {
    const status = row.status as string;
    const amount = Number(row.amount_cents ?? 0);
    const student = row.students as StudentEmbed | StudentEmbed[] | null;
    const st = Array.isArray(student) ? student[0] : student;

    const inMonthlyWallet =
      st != null &&
      isStudentInMonthlyOperationalWallet({
        status: String(st.status ?? ""),
        is_exempt: st.is_exempt === true,
        archived_at: st.archived_at ?? null,
        removed_at: st.removed_at ?? null,
      });

    if (status === "paid") {
      if (!inMonthlyWallet) continue;
      totalPaidReceivedCents += amount;
      paidCount += 1;
      const label = openPlanLabel(st);
      byPlan.set(label, (byPlan.get(label) ?? 0) + amount);
    } else if (status === "scholarship") {
      if (!inMonthlyWallet) continue;
      scholarshipCount += 1;
    } else if (status === "other") {
      if (!inMonthlyWallet) continue;
      otherCount += 1;
    }
  }

  const paidByPlanLabel = [...byPlan.entries()]
    .map(([planLabel, totalCents]) => ({ planLabel, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents);

  return {
    referenceMonth: referenceMonthFirstDay,
    totalPaidReceivedCents,
    paidCount,
    scholarshipCount,
    otherCount,
    paidByPlanLabel,
  };
}
