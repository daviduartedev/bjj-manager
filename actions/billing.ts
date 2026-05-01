"use server";

import { revalidatePath } from "next/cache";

import { mapBillingActionError } from "@/lib/billing/action-errors";
import { applyStudentPlanChange } from "@/lib/billing/student-plan";
import { ROUTES } from "@/lib/routes";
import {
  setStudentPlanSchema,
  updatePlanPriceSchema,
} from "@/lib/validations/billing";
import { createClient } from "@/lib/supabase/server";

export type BillingActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updatePlanPrice(
  input: unknown,
): Promise<BillingActionResult> {
  try {
    const parsed = updatePlanPriceSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Verifique o preço indicado e tente novamente.";
      return { ok: false, error: msg };
    }

    const { planId, priceCents } = parsed.data;
    const supabase = await createClient();

    const { data: row, error: selErr } = await supabase
      .from("plans")
      .select("id")
      .eq("id", planId)
      .maybeSingle();

    if (selErr) throw selErr;
    if (!row) {
      return {
        ok: false,
        error:
          "Plano não encontrado ou já não está disponível nesta academia.",
      };
    }

    const { error: upErr } = await supabase
      .from("plans")
      .update({
        price_cents: priceCents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId);

    if (upErr) throw upErr;

    revalidatePath(ROUTES.alunos);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}

export async function setStudentPlan(input: unknown): Promise<BillingActionResult> {
  try {
    const parsed = setStudentPlanSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        Object.values(first).flat()[0] ??
        "Verifique o plano, o dia de vencimento e tente novamente.";
      return { ok: false, error: msg };
    }

    const { studentId, planId, dueDay, customPriceCents } = parsed.data;
    const supabase = await createClient();

    await applyStudentPlanChange({
      supabase,
      studentId,
      planId,
      dueDay,
      customPriceCents,
    });

    revalidatePath(ROUTES.alunos);
    revalidatePath(`${ROUTES.alunos}/${studentId}/editar`);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapBillingActionError(e) };
  }
}
