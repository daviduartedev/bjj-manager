import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth";
import type { LessonPlanContent } from "@/lib/validations/lesson-plans";

export type LessonPlanListRow = {
  id: string;
  plan_kind: "adult" | "kids_1" | "kids_2";
  reference_month: string;
  title: string;
  status: "draft" | "published" | "archived";
  updated_at: string;
};

export type LessonPlanFilters = {
  planKind?: "adult" | "kids_1" | "kids_2";
  status?: "draft" | "published" | "archived";
  /** Formato `YYYY-MM` — filtra por `reference_month` exato. */
  referenceMonth?: string;
};

export async function loadLessonPlansList(
  filters: LessonPlanFilters = {},
): Promise<{ ctx: Awaited<ReturnType<typeof getCurrentAccount>>; rows: LessonPlanListRow[] }> {
  const ctx = await getCurrentAccount();
  if (!ctx) return { ctx: null, rows: [] };

  const supabase = await createClient();
  let q = supabase
    .from("lesson_plans")
    .select("id, plan_kind, reference_month, title, status, updated_at")
    .eq("account_id", ctx.account.id)
    .order("reference_month", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(120);

  if (filters.planKind) q = q.eq("plan_kind", filters.planKind);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.referenceMonth && /^\d{4}-\d{2}$/.test(filters.referenceMonth)) {
    q = q.eq("reference_month", `${filters.referenceMonth}-01`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return { ctx, rows: ((data as LessonPlanListRow[]) ?? []) };
}

export type LessonPlanDetail = {
  id: string;
  plan_kind: "adult" | "kids_1" | "kids_2";
  reference_month: string;
  title: string;
  status: "draft" | "published" | "archived";
  internal_notes: string | null;
  current_revision: { revision_number: number; content_json: LessonPlanContent } | null;
  revisions: Array<{ id: string; revision_number: number; created_at: string; change_summary: string | null }>;
};

export async function loadLessonPlanDetail(planId: string): Promise<LessonPlanDetail | null> {
  const ctx = await getCurrentAccount();
  if (!ctx) return null;

  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("lesson_plans")
    .select(
      "id, plan_kind, reference_month, title, status, internal_notes, current_revision_id",
    )
    .eq("id", planId)
    .eq("account_id", ctx.account.id)
    .maybeSingle();
  if (!plan) return null;

  const { data: revs } = await supabase
    .from("lesson_plan_revisions")
    .select("id, revision_number, created_at, change_summary, content_json")
    .eq("lesson_plan_id", planId)
    .order("revision_number", { ascending: false });

  const allRevs = (revs as Array<{
    id: string;
    revision_number: number;
    created_at: string;
    change_summary: string | null;
    content_json: LessonPlanContent;
  }>) ?? [];

  const currentRev = allRevs.find((r) => r.id === plan.current_revision_id) ?? allRevs[0];

  return {
    id: plan.id as string,
    plan_kind: plan.plan_kind as "adult" | "kids_1" | "kids_2",
    reference_month: plan.reference_month as string,
    title: plan.title as string,
    status: plan.status as "draft" | "published" | "archived",
    internal_notes: (plan.internal_notes as string | null) ?? null,
    current_revision: currentRev
      ? { revision_number: currentRev.revision_number, content_json: currentRev.content_json }
      : null,
    revisions: allRevs.map((r) => ({
      id: r.id,
      revision_number: r.revision_number,
      created_at: r.created_at,
      change_summary: r.change_summary,
    })),
  };
}
