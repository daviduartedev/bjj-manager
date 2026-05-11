"use server";

import { revalidatePath } from "next/cache";

import { mapDocumentActionError } from "@/lib/documents/action-errors";
import {
  buildDocumentPath,
  createDocumentSignedUrl,
  uploadDocumentArtifact,
} from "@/lib/documents/storage";
import { LessonPlanService, LessonPlanServiceError } from "@/lib/lesson-plans/service";
import { renderLessonPlanPdf } from "@/lib/lesson-plans/pdf";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  archiveLessonPlanSchema,
  createLessonPlanSchema,
  duplicateLessonPlanSchema,
  publishLessonPlanSchema,
  restoreLessonPlanSchema,
  updateLessonPlanSchema,
} from "@/lib/validations/lesson-plans";

export type LessonPlanActionResult<T> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

async function ctx(): Promise<
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      accountId: string;
      userId: string;
      academy: { name: string; legal_name: string | null };
    }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão inválida." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_id, accounts(name, legal_name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.account_id) return { ok: false, error: "Conta não encontrada." };
  const accField = (profile as unknown as {
    accounts: { name: string; legal_name: string | null } | { name: string; legal_name: string | null }[] | null;
  }).accounts;
  const acc = Array.isArray(accField) ? accField[0] : accField;
  if (!acc) return { ok: false, error: "Conta não encontrada." };

  return {
    ok: true,
    supabase,
    accountId: profile.account_id as string,
    userId: user.id,
    academy: { name: acc.name, legal_name: acc.legal_name },
  };
}

function mapServiceError(e: unknown): string {
  if (e instanceof LessonPlanServiceError) {
    if (e.code === "NOT_FOUND") return "Plano não encontrado.";
    if (e.code === "ALREADY_PUBLISHED") return "Este plano já está publicado.";
    if (e.code === "INVALID_STATE") return e.message;
  }
  return mapDocumentActionError(e);
}

export async function createLessonPlan(input: unknown): Promise<LessonPlanActionResult<{ id: string }>> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };

  const parsed = createLessonPlanSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      "Verifique os dados do plano.";
    return { ok: false, error: msg };
  }

  try {
    const svc = new LessonPlanService(c.supabase, c.accountId, c.userId);
    const r = await svc.create(parsed.data);
    revalidatePath(ROUTES.pedagogicoPlanos);
    return { ok: true, id: r.id };
  } catch (e) {
    return { ok: false, error: mapServiceError(e) };
  }
}

export async function updateLessonPlan(input: unknown): Promise<LessonPlanActionResult<{ revisionNumber: number | null }>> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const parsed = updateLessonPlanSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      "Verifique os dados do plano.";
    return { ok: false, error: msg };
  }
  try {
    const svc = new LessonPlanService(c.supabase, c.accountId, c.userId);
    const r = await svc.update(parsed.data);
    revalidatePath(ROUTES.pedagogicoPlanos);
    revalidatePath(`${ROUTES.pedagogicoPlanos}/${parsed.data.lessonPlanId}`);
    return { ok: true, revisionNumber: r.revisionNumber };
  } catch (e) {
    return { ok: false, error: mapServiceError(e) };
  }
}

export async function publishLessonPlan(input: unknown): Promise<LessonPlanActionResult<{ archivedExistingId: string | null }>> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const parsed = publishLessonPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Identificador inválido." };
  }
  try {
    const svc = new LessonPlanService(c.supabase, c.accountId, c.userId);
    const r = await svc.publish(parsed.data);
    revalidatePath(ROUTES.pedagogicoPlanos);
    revalidatePath(`${ROUTES.pedagogicoPlanos}/${parsed.data.lessonPlanId}`);
    return { ok: true, archivedExistingId: r.archivedExistingId };
  } catch (e) {
    return { ok: false, error: mapServiceError(e) };
  }
}

export async function archiveLessonPlan(input: unknown): Promise<LessonPlanActionResult<unknown>> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const parsed = archiveLessonPlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Identificador inválido." };
  try {
    const svc = new LessonPlanService(c.supabase, c.accountId, c.userId);
    await svc.archive(parsed.data.lessonPlanId);
    revalidatePath(ROUTES.pedagogicoPlanos);
    revalidatePath(`${ROUTES.pedagogicoPlanos}/${parsed.data.lessonPlanId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapServiceError(e) };
  }
}

export async function restoreLessonPlan(input: unknown): Promise<LessonPlanActionResult<unknown>> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const parsed = restoreLessonPlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Identificador inválido." };
  try {
    const svc = new LessonPlanService(c.supabase, c.accountId, c.userId);
    await svc.restoreToDraft(parsed.data.lessonPlanId);
    revalidatePath(ROUTES.pedagogicoPlanos);
    revalidatePath(`${ROUTES.pedagogicoPlanos}/${parsed.data.lessonPlanId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapServiceError(e) };
  }
}

export async function duplicateLessonPlan(input: unknown): Promise<LessonPlanActionResult<{ id: string }>> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const parsed = duplicateLessonPlanSchema.safeParse(input);
  if (!parsed.success) {
    const msg =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      "Verifique os dados.";
    return { ok: false, error: msg };
  }
  try {
    const svc = new LessonPlanService(c.supabase, c.accountId, c.userId);
    const r = await svc.duplicate(parsed.data);
    revalidatePath(ROUTES.pedagogicoPlanos);
    return { ok: true, id: r.id };
  } catch (e) {
    return { ok: false, error: mapServiceError(e) };
  }
}

export async function exportLessonPlanPdf(
  input: unknown,
): Promise<LessonPlanActionResult<{ url: string }>> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const parsed = archiveLessonPlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Identificador inválido." };

  try {
    const { data: plan } = await c.supabase
      .from("lesson_plans")
      .select(
        "id, plan_kind, reference_month, title, current_revision_id, lesson_plan_revisions!inner(revision_number, content_json)",
      )
      .eq("id", parsed.data.lessonPlanId)
      .eq("account_id", c.accountId)
      .maybeSingle();
    if (!plan) return { ok: false, error: "Plano não encontrado." };

    const revs = (plan.lesson_plan_revisions as Array<{ revision_number: number; content_json: unknown }>) ?? [];
    const target =
      revs.find((r) => false) ??
      [...revs].sort((a, b) => b.revision_number - a.revision_number)[0];
    if (!target) return { ok: false, error: "Plano sem revisões." };

    const pdf = await renderLessonPlanPdf({
      academyName: c.academy.name,
      legalName: c.academy.legal_name,
      planKind: plan.plan_kind as "adult" | "kids_1" | "kids_2",
      referenceMonth: plan.reference_month as string,
      title: plan.title as string,
      revisionNumber: target.revision_number,
      content: target.content_json as Parameters<typeof renderLessonPlanPdf>[0]["content"],
    });

    const path = buildDocumentPath({
      accountId: c.accountId,
      documentId: `lesson-plan-${plan.id}-rev-${target.revision_number}`,
      ext: "pdf",
    });

    await uploadDocumentArtifact(c.supabase, {
      path,
      content: pdf,
      contentType: "application/pdf",
    });

    const url = await createDocumentSignedUrl(c.supabase, path);
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: mapServiceError(e) };
  }
}
