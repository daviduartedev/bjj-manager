import type { createClient } from "@/lib/supabase/server";
import { toCalendarDateStringInAppTZ } from "@/lib/dates/parse-calendar-date";
import type { StudentKind } from "@/lib/students/degree";
import { planKindMatchesStudentContext } from "@/lib/students/plan-kind";
import type { PlanKind } from "@/lib/students/plan-kind";

import { BillingDomainError } from "./domain-error";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

function resolveNextCustomPrice(
  customPriceCents: number | null | undefined,
  openRow: { custom_price_cents: number | null } | null,
): number | null {
  if (customPriceCents === undefined) {
    return openRow?.custom_price_cents ?? null;
  }
  if (customPriceCents === null) {
    return null;
  }
  return customPriceCents;
}

/**
 * Fecha vínculo aberto (se existir) e insere **sempre** nova linha (**ENT-7.3**, **BLM-5**).
 * `customPriceCents`: omitido → preserva preço personalizado do vínculo aberto; `null` → remove.
 */
export async function applyStudentPlanChange(args: {
  supabase: SupabaseServer;
  studentId: string;
  planId: string;
  dueDay: number;
  customPriceCents?: number | null;
}): Promise<void> {
  const { supabase, studentId, planId, dueDay, customPriceCents } = args;

  const { data: studentRow, error: studentErr } = await supabase
    .from("students")
    .select("id, kind, current_belt_id")
    .eq("id", studentId)
    .maybeSingle();

  if (studentErr) throw studentErr;
  if (!studentRow) {
    throw new BillingDomainError("STUDENT_NOT_AVAILABLE");
  }

  const studentKind = studentRow.kind as StudentKind;

  const { data: beltRow, error: beltErr } = await supabase
    .from("belts")
    .select("slug")
    .eq("id", studentRow.current_belt_id)
    .maybeSingle();

  if (beltErr) throw beltErr;
  const beltSlug = beltRow?.slug ?? null;

  const { data: planRow, error: planErr } = await supabase
    .from("plans")
    .select("id, kind, active")
    .eq("id", planId)
    .maybeSingle();

  if (planErr) throw planErr;
  if (!planRow) {
    throw new BillingDomainError("PLAN_NOT_AVAILABLE");
  }
  if (!planRow.active) {
    throw new BillingDomainError("PLAN_INACTIVE");
  }

  const planKind = planRow.kind as PlanKind;
  if (
    !planKindMatchesStudentContext({
      planKind,
      studentKind,
      beltSlug,
    })
  ) {
    throw new BillingDomainError("PLAN_KIND_MISMATCH");
  }

  const { data: openRow, error: openErr } = await supabase
    .from("student_plans")
    .select("id, custom_price_cents")
    .eq("student_id", studentId)
    .is("ended_at", null)
    .maybeSingle();

  if (openErr) throw openErr;

  const today = toCalendarDateStringInAppTZ(new Date());
  const nextCustom = resolveNextCustomPrice(customPriceCents, openRow);

  if (openRow?.id) {
    const { error: endErr } = await supabase
      .from("student_plans")
      .update({ ended_at: today, updated_at: new Date().toISOString() })
      .eq("id", openRow.id);
    if (endErr) throw endErr;
  }

  const { error: insErr } = await supabase.from("student_plans").insert({
    student_id: studentId,
    plan_id: planId,
    due_day: dueDay,
    started_at: today,
    custom_price_cents: nextCustom,
  });
  if (insErr) throw insErr;
}
