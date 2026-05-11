import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateLessonPlanInput,
  DuplicateLessonPlanInput,
  LessonPlanContent,
  PublishLessonPlanInput,
  UpdateLessonPlanInput,
} from "@/lib/validations/lesson-plans";

export type LessonPlanRow = {
  id: string;
  account_id: string;
  plan_kind: "adult" | "kids_1" | "kids_2";
  reference_month: string;
  title: string;
  status: "draft" | "published" | "archived";
  internal_notes: string | null;
  current_revision_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LessonPlanWithRevision = LessonPlanRow & {
  current_revision: { revision_number: number; content_json: LessonPlanContent } | null;
};

export class LessonPlanServiceError extends Error {
  constructor(readonly code: "NOT_FOUND" | "ALREADY_PUBLISHED" | "INVALID_STATE", message?: string) {
    super(message ?? code);
  }
}

export class LessonPlanService {
  constructor(private readonly client: SupabaseClient, private readonly accountId: string, private readonly userId: string | null) {}

  async create(input: CreateLessonPlanInput): Promise<{ id: string }> {
    const { data: planRow, error: planErr } = await this.client
      .from("lesson_plans")
      .insert({
        account_id: this.accountId,
        plan_kind: input.planKind,
        reference_month: input.referenceMonth,
        title: input.title,
        status: "draft",
        internal_notes: input.internalNotes ?? null,
        created_by: this.userId,
      })
      .select("id")
      .single();
    if (planErr) throw planErr;
    const planId = planRow.id as string;

    const { data: revRow, error: revErr } = await this.client
      .from("lesson_plan_revisions")
      .insert({
        lesson_plan_id: planId,
        revision_number: 1,
        content_json: input.content,
        change_summary: "Versão inicial",
        created_by: this.userId,
      })
      .select("id")
      .single();
    if (revErr) throw revErr;

    await this.client
      .from("lesson_plans")
      .update({
        current_revision_id: revRow.id as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId);

    return { id: planId };
  }

  async update(input: UpdateLessonPlanInput): Promise<{ revisionNumber: number | null }> {
    const planId = input.lessonPlanId;

    if (input.content) {
      const { data: lastRev } = await this.client
        .from("lesson_plan_revisions")
        .select("revision_number")
        .eq("lesson_plan_id", planId)
        .order("revision_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      const next = (lastRev?.revision_number ?? 0) + 1;

      const { data: revRow, error: revErr } = await this.client
        .from("lesson_plan_revisions")
        .insert({
          lesson_plan_id: planId,
          revision_number: next,
          content_json: input.content,
          change_summary: input.changeSummary ?? null,
          created_by: this.userId,
        })
        .select("id, revision_number")
        .single();
      if (revErr) throw revErr;

      const { error: updErr } = await this.client
        .from("lesson_plans")
        .update({
          title: input.title,
          internal_notes: input.internalNotes,
          current_revision_id: revRow.id as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId);
      if (updErr) throw updErr;

      return { revisionNumber: revRow.revision_number as number };
    }

    if (input.title !== undefined || input.internalNotes !== undefined) {
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.title !== undefined) update.title = input.title;
      if (input.internalNotes !== undefined) update.internal_notes = input.internalNotes;
      const { error: updErr } = await this.client
        .from("lesson_plans")
        .update(update)
        .eq("id", planId);
      if (updErr) throw updErr;
    }
    return { revisionNumber: null };
  }

  async publish(input: PublishLessonPlanInput): Promise<{ archivedExistingId: string | null }> {
    const { data: plan, error } = await this.client
      .from("lesson_plans")
      .select("id, plan_kind, reference_month, status")
      .eq("id", input.lessonPlanId)
      .maybeSingle();
    if (error) throw error;
    if (!plan) throw new LessonPlanServiceError("NOT_FOUND");
    if (plan.status === "published") throw new LessonPlanServiceError("ALREADY_PUBLISHED");

    const { data: existing } = await this.client
      .from("lesson_plans")
      .select("id")
      .eq("account_id", this.accountId)
      .eq("plan_kind", plan.plan_kind)
      .eq("reference_month", plan.reference_month)
      .eq("status", "published")
      .neq("id", plan.id)
      .maybeSingle();

    let archivedId: string | null = null;
    if (existing) {
      if (!input.archiveExisting) {
        throw new LessonPlanServiceError(
          "INVALID_STATE",
          "Já existe um plano publicado para este par. Confirme arquivar antes de publicar.",
        );
      }
      const { error: arErr } = await this.client
        .from("lesson_plans")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (arErr) throw arErr;
      archivedId = existing.id as string;
    }

    const { error: pubErr } = await this.client
      .from("lesson_plans")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .eq("id", plan.id);
    if (pubErr) throw pubErr;

    return { archivedExistingId: archivedId };
  }

  async archive(planId: string): Promise<void> {
    const { error } = await this.client
      .from("lesson_plans")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId);
    if (error) throw error;
  }

  /**
   * Reabre um plano arquivado como rascunho. Útil para corrigir um plano que
   * foi arquivado por engano — permanece editável até nova publicação.
   * Requer que o plano esteja em `archived` para evitar fluxos não-monotónicos.
   */
  async restoreToDraft(planId: string): Promise<void> {
    const { data: plan } = await this.client
      .from("lesson_plans")
      .select("id, status")
      .eq("id", planId)
      .maybeSingle();
    if (!plan) throw new LessonPlanServiceError("NOT_FOUND");
    if (plan.status !== "archived") {
      throw new LessonPlanServiceError(
        "INVALID_STATE",
        "Só planos arquivados podem ser restaurados.",
      );
    }

    const { error } = await this.client
      .from("lesson_plans")
      .update({
        status: "draft",
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId);
    if (error) throw error;
  }

  async duplicate(input: DuplicateLessonPlanInput): Promise<{ id: string }> {
    const { data: original } = await this.client
      .from("lesson_plans")
      .select(
        "id, plan_kind, title, internal_notes, current_revision_id, lesson_plan_revisions(revision_number, content_json, lesson_plan_id)",
      )
      .eq("id", input.lessonPlanId)
      .maybeSingle();

    if (!original) throw new LessonPlanServiceError("NOT_FOUND");

    const revs = (original.lesson_plan_revisions as Array<{ revision_number: number; content_json: LessonPlanContent }> | null) ?? [];
    const sorted = [...revs].sort((a, b) => b.revision_number - a.revision_number);
    const content = sorted[0]?.content_json ?? { topics: [] };

    const { data: planRow, error: planErr } = await this.client
      .from("lesson_plans")
      .insert({
        account_id: this.accountId,
        plan_kind: input.targetPlanKind ?? original.plan_kind,
        reference_month: input.targetReferenceMonth,
        title: input.title ?? `${original.title} (cópia)`,
        status: "draft",
        internal_notes: original.internal_notes ?? null,
        created_by: this.userId,
      })
      .select("id")
      .single();
    if (planErr) throw planErr;
    const newId = planRow.id as string;

    const { data: revRow, error: revErr } = await this.client
      .from("lesson_plan_revisions")
      .insert({
        lesson_plan_id: newId,
        revision_number: 1,
        content_json: content,
        change_summary: `Duplicado de ${input.lessonPlanId}`,
        created_by: this.userId,
      })
      .select("id")
      .single();
    if (revErr) throw revErr;

    await this.client
      .from("lesson_plans")
      .update({
        current_revision_id: revRow.id as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", newId);

    return { id: newId };
  }
}
