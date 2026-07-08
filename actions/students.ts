"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/auth";
import { mapBillingActionError } from "@/lib/billing/action-errors";
import { BillingDomainError } from "@/lib/billing/domain-error";
import { applyStudentPlanChange } from "@/lib/billing/student-plan";
import {
  applyWeightToCurrentGraduation,
  GraduationWeightError,
} from "@/lib/graduation/apply-current-weight";
import {
  getBeltsCatalog,
  getPlansCatalog,
  getStudentCatalog,
} from "@/lib/data/students-catalog";
import { ROUTES } from "@/lib/routes";
import { mapStudentServerError } from "@/lib/students/action-errors";
import { onlyDigits } from "@/lib/students/input-masks";
import {
  beltMatchesStudentKindForBeltRow,
  planKindMatchesStudentContext,
} from "@/lib/students/plan-kind";
import type { StudentKind } from "@/lib/students/degree";
import { isValidDegreeForBelt } from "@/lib/students/degree";
import type { PlanKind } from "@/lib/students/plan-kind";
import { createClient } from "@/lib/supabase/server";
import {
  buildQuickEditFormSchema,
  buildStudentFullFormSchema,
  studentUiStatusSchema,
  type QuickEditFormValues,
  type StudentFullFormValues,
} from "@/lib/validations/students";

export type StudentActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function fieldErrorsFromZod(err: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  const flat = err.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v?.length) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

async function resolveBelt(
  supabase: Awaited<ReturnType<typeof createClient>>,
  beltId: string,
) {
  const { data, error } = await supabase
    .from("belts")
    .select("id, slug, kind")
    .eq("id", beltId)
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; slug: string; kind: "adult" | "kids" } | null;
}

async function resolvePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  planId: string,
) {
  const { data, error } = await supabase
    .from("plans")
    .select("id, kind")
    .eq("id", planId)
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; kind: PlanKind } | null;
}

export async function createStudent(
  values: unknown,
): Promise<StudentActionResult> {
  try {
    const { belts, plans } = await getStudentCatalog();
    const schema = buildStudentFullFormSchema(belts, plans);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }
    const v = parsed.data as StudentFullFormValues;
    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }

    const supabase = await createClient();

    const belt = await resolveBelt(supabase, v.current_belt_id);
    if (!belt || !beltMatchesStudentKindForBeltRow(belt, v.kind as StudentKind)) {
      return { ok: false, error: "Dados de faixa inválidos." };
    }
    if (!v.is_exempt) {
      const plan = await resolvePlan(supabase, v.plan_id!);
      if (
        !plan ||
        !planKindMatchesStudentContext({
          planKind: plan.kind,
          studentKind: v.kind as StudentKind,
          beltSlug: belt.slug,
        })
      ) {
        return {
          ok: false,
          error: "Dados de plano inválidos para a faixa do aluno.",
        };
      }
    }
    if (!isValidDegreeForBelt(belt.slug, belt.kind, v.current_degree)) {
      return { ok: false, error: "Grau inválido para a faixa." };
    }

    const documentDigits =
      v.document != null ? onlyDigits(v.document) : "";
    const phoneDigits = v.phone != null ? onlyDigits(v.phone) : "";

    const { data: inserted, error: insertStudentError } = await supabase
      .from("students")
      .insert({
        account_id: ctx.account.id,
        kind: v.kind,
        full_name: v.full_name.trim(),
        current_belt_id: v.current_belt_id,
        current_degree: v.current_degree,
        status: "active",
        birth_date: v.birth_date,
        academy_start_date: v.academy_start_date,
        document: documentDigits.length ? documentDigits : null,
        phone: phoneDigits.length ? phoneDigits : null,
        email: v.email?.trim().toLowerCase() ?? null,
        notes: v.notes?.trim() ?? null,
        is_exempt: v.is_exempt ?? false,
      })
      .select("id")
      .single();

    if (insertStudentError || !inserted) {
      throw insertStudentError ?? new Error("insert student");
    }

    if (!v.is_exempt && v.plan_id != null && v.due_day != null) {
      await applyStudentPlanChange({
        supabase,
        studentId: inserted.id,
        planId: v.plan_id,
        dueDay: v.due_day,
      });
    }

    revalidatePath(ROUTES.alunos);
    return { ok: true };
  } catch (e) {
    if (e instanceof BillingDomainError) {
      return { ok: false, error: mapBillingActionError(e) };
    }
    return { ok: false, error: mapStudentServerError(e) };
  }
}

export async function updateStudent(
  studentId: string,
  values: unknown,
): Promise<StudentActionResult> {
  try {
    const { belts, plans } = await getStudentCatalog();
    const schema = buildStudentFullFormSchema(belts, plans);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }
    const v = parsed.data as StudentFullFormValues;
    const supabase = await createClient();

    const belt = await resolveBelt(supabase, v.current_belt_id);
    if (!belt || !beltMatchesStudentKindForBeltRow(belt, v.kind as StudentKind)) {
      return { ok: false, error: "Dados de faixa inválidos." };
    }
    if (!v.is_exempt) {
      const plan = await resolvePlan(supabase, v.plan_id!);
      if (
        !plan ||
        !planKindMatchesStudentContext({
          planKind: plan.kind,
          studentKind: v.kind as StudentKind,
          beltSlug: belt.slug,
        })
      ) {
        return {
          ok: false,
          error: "Dados de plano inválidos para a faixa do aluno.",
        };
      }
    }
    if (!isValidDegreeForBelt(belt.slug, belt.kind, v.current_degree)) {
      return { ok: false, error: "Grau inválido para a faixa." };
    }

    const documentDigits =
      v.document != null ? onlyDigits(v.document) : "";
    const phoneDigits = v.phone != null ? onlyDigits(v.phone) : "";

    const { error: upErr } = await supabase
      .from("students")
      .update({
        kind: v.kind,
        full_name: v.full_name.trim(),
        current_belt_id: v.current_belt_id,
        current_degree: v.current_degree,
        birth_date: v.birth_date,
        academy_start_date: v.academy_start_date,
        document: documentDigits.length ? documentDigits : null,
        phone: phoneDigits.length ? phoneDigits : null,
        email: v.email?.trim().toLowerCase() ?? null,
        notes: v.notes?.trim() ?? null,
        is_exempt: v.is_exempt ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentId);

    if (upErr) throw upErr;

    if (!v.is_exempt && v.plan_id != null && v.due_day != null) {
      await applyStudentPlanChange({
        supabase,
        studentId,
        planId: v.plan_id,
        dueDay: v.due_day,
      });
    }

    await applyWeightToCurrentGraduation(
      supabase,
      studentId,
      v.current_belt_id,
      v.current_degree,
      v.weight_kg ?? null,
    );

    revalidatePath(ROUTES.alunos);
    revalidatePath(ROUTES.mensalidades);
    revalidatePath(`${ROUTES.alunos}/${studentId}/editar`);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof GraduationWeightError) {
      return { ok: false, error: e.message, fieldErrors: { weight_kg: [e.message] } };
    }
    if (e instanceof BillingDomainError) {
      return { ok: false, error: mapBillingActionError(e) };
    }
    return { ok: false, error: mapStudentServerError(e) };
  }
}

export async function quickUpdateStudent(
  studentId: string,
  studentKind: StudentKind,
  values: unknown,
): Promise<StudentActionResult> {
  try {
    const belts = await getBeltsCatalog();
    const plans = await getPlansCatalog();
    const schema = buildQuickEditFormSchema(belts, plans, studentKind);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }
    const v = parsed.data as QuickEditFormValues;
    const supabase = await createClient();

    const belt = await resolveBelt(supabase, v.current_belt_id);
    if (!belt || !beltMatchesStudentKindForBeltRow(belt, studentKind)) {
      return { ok: false, error: "Dados de faixa inválidos." };
    }
    if (!isValidDegreeForBelt(belt.slug, belt.kind, v.current_degree)) {
      return { ok: false, error: "Grau inválido para a faixa." };
    }

    if (!v.is_exempt) {
      const plan = await resolvePlan(supabase, v.plan_id!);
      if (
        !plan ||
        !planKindMatchesStudentContext({
          planKind: plan.kind,
          studentKind,
          beltSlug: belt.slug,
        })
      ) {
        return {
          ok: false,
          error: "Dados de plano inválidos para a faixa do aluno.",
        };
      }
    }

    const { error: upErr } = await supabase
      .from("students")
      .update({
        status: v.status,
        current_belt_id: v.current_belt_id,
        current_degree: v.current_degree,
        is_exempt: v.is_exempt ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentId);

    if (upErr) throw upErr;

    if (!v.is_exempt && v.plan_id != null && v.due_day != null) {
      await applyStudentPlanChange({
        supabase,
        studentId,
        planId: v.plan_id,
        dueDay: v.due_day,
      });
    }

    await applyWeightToCurrentGraduation(
      supabase,
      studentId,
      v.current_belt_id,
      v.current_degree,
      v.weight_kg ?? null,
    );

    revalidatePath(ROUTES.alunos);
    revalidatePath(ROUTES.mensalidades);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof GraduationWeightError) {
      return { ok: false, error: e.message, fieldErrors: { weight_kg: [e.message] } };
    }
    if (e instanceof BillingDomainError) {
      return { ok: false, error: mapBillingActionError(e) };
    }
    return { ok: false, error: mapStudentServerError(e) };
  }
}

export async function setStudentStatus(
  studentId: string,
  status: unknown,
): Promise<StudentActionResult> {
  try {
    const st = studentUiStatusSchema.safeParse(status);
    if (!st.success) {
      return { ok: false, error: "Situação inválida." };
    }
    const supabase = await createClient();
    /** `inactive` / `paused` **não equivalem** a arquivo/remoção (**STU-3**). */
    const { error } = await supabase
      .from("students")
      .update({
        status: st.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentId);
    if (error) throw error;
    revalidatePath(ROUTES.alunos);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

function lifecycleStamp(profileId: string, nowIso: string) {
  return {
    lifecycle_updated_at: nowIso,
    lifecycle_updated_by: profileId,
    updated_at: nowIso,
  } as const;
}

/** **STU-10**: retira da lista pré-definida / mensalidades sem apagar dados financeiros. */
export async function archiveStudent(
  studentId: string,
): Promise<StudentActionResult> {
  try {
    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }
    const supabase = await createClient();
    const now = new Date().toISOString();
    const stamp = lifecycleStamp(ctx.profile.id, now);
    const { data, error } = await supabase
      .from("students")
      .update({
        archived_at: now,
        ...stamp,
      })
      .eq("id", studentId)
      .is("archived_at", null)
      .is("removed_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        ok: false,
        error:
          "Não foi possível arquivar este registo (já está arquivado ou removido da operação corrente).",
      };
    }
    revalidatePath(ROUTES.alunos);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

export async function unarchiveStudent(
  studentId: string,
): Promise<StudentActionResult> {
  try {
    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }
    const supabase = await createClient();
    const now = new Date().toISOString();
    const stamp = lifecycleStamp(ctx.profile.id, now);
    const { data, error } = await supabase
      .from("students")
      .update({
        archived_at: null,
        ...stamp,
      })
      .eq("id", studentId)
      .not("archived_at", "is", null)
      .is("removed_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        ok: false,
        error: "Este aluno não está arquivado ou já foi removido da operação corrente.",
      };
    }
    revalidatePath(ROUTES.alunos);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

/** **STU-11**: remoção soft distinta do arquivo; sem DELETE de pagamentos. */
export async function removeStudentRecord(
  studentId: string,
): Promise<StudentActionResult> {
  try {
    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }
    const supabase = await createClient();
    const now = new Date().toISOString();
    const stamp = lifecycleStamp(ctx.profile.id, now);
    const { data, error } = await supabase
      .from("students")
      .update({
        removed_at: now,
        archived_at: null,
        ...stamp,
      })
      .eq("id", studentId)
      .is("removed_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        ok: false,
        error: "Este registo já está marcado como removido ou não existe.",
      };
    }
    revalidatePath(ROUTES.alunos);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

export async function undoRemoveStudentRecord(
  studentId: string,
): Promise<StudentActionResult> {
  try {
    const ctx = await getCurrentAccount();
    if (!ctx) {
      return {
        ok: false,
        error:
          "Conta da academia indisponível. Confirme o vínculo perfil/conta ou volte a iniciar sessão.",
      };
    }
    const supabase = await createClient();
    const now = new Date().toISOString();
    const stamp = lifecycleStamp(ctx.profile.id, now);
    const { data, error } = await supabase
      .from("students")
      .update({
        removed_at: null,
        ...stamp,
      })
      .eq("id", studentId)
      .not("removed_at", "is", null)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { ok: false, error: "Não há remoção soft activa para anular neste registo." };
    }
    revalidatePath(ROUTES.alunos);
    revalidatePath(`${ROUTES.alunos}/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

/** Semântica **STU-9.1**: desativa o aluno (`inactive`), distinto de **arquivar** / **remover**. */
export async function deleteStudent(
  studentId: string,
): Promise<StudentActionResult> {
  return setStudentStatus(studentId, "inactive");
}
