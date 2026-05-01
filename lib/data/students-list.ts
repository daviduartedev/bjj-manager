import { createClient } from "@/lib/supabase/server";
import { STUDENTS_PAGE_SIZE } from "@/lib/constants/students";
import type { PlanKind } from "@/lib/students/plan-kind";
import type { ListSortKey } from "@/lib/validations/students";

export type ListStudentRow = {
  id: string;
  full_name: string;
  kind: "adult" | "kids";
  status: string;
  birth_date: string | null;
  academy_start_date: string | null;
  current_belt_id: string;
  current_degree: number;
  updated_at: string;
  belt: { slug: string; kind: "adult" | "kids" } | null;
  openPlan: {
    plan_id: string;
    due_day: number;
    plan_name: string;
    plan_kind: PlanKind;
  } | null;
};

export type ListStudentsParams = {
  q?: string;
  kind?: "adult" | "kids" | "all";
  status?: "active" | "inactive" | "paused" | "all";
  sort?: ListSortKey;
  page?: number;
};

export async function listStudentsQuery(
  params: ListStudentsParams,
): Promise<{
  rows: ListStudentRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const pageSize = STUDENTS_PAGE_SIZE;
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let q = supabase.from("students").select(
    `
      id,
      full_name,
      kind,
      status,
      birth_date,
      academy_start_date,
      current_belt_id,
      current_degree,
      updated_at,
      belts!students_current_belt_id_fkey ( slug, kind ),
      student_plans ( plan_id, due_day, ended_at, plans ( name, kind ) )
    `,
    { count: "exact" },
  );

  const search = params.q?.trim();
  if (search) {
    q = q.ilike("full_name", `%${search}%`);
  }
  if (params.kind === "adult" || params.kind === "kids") {
    q = q.eq("kind", params.kind);
  }
  if (
    params.status === "active" ||
    params.status === "inactive" ||
    params.status === "paused"
  ) {
    q = q.eq("status", params.status);
  }

  const sort = params.sort ?? "name";
  if (sort === "name") {
    q = q.order("full_name", { ascending: true });
  } else if (sort === "academy_start") {
    q = q
      .order("academy_start_date", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true });
  } else {
    q = q
      .order("updated_at", { ascending: false })
      .order("full_name", { ascending: true });
  }

  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) throw error;

  const rows: ListStudentRow[] = (data ?? []).map((raw: Record<string, unknown>) => {
    const beltsRel = raw.belts as { slug: string; kind: "adult" | "kids" } | null;
    const spArr = raw.student_plans as
      | {
          plan_id: string;
          due_day: number;
          ended_at: string | null;
          plans: { name: string; kind: PlanKind } | null;
        }[]
      | null;
    const open = spArr?.find((s) => s.ended_at == null);
    return {
      id: raw.id as string,
      full_name: raw.full_name as string,
      kind: raw.kind as "adult" | "kids",
      status: raw.status as string,
      birth_date: (raw.birth_date as string | null) ?? null,
      academy_start_date: (raw.academy_start_date as string | null) ?? null,
      current_belt_id: raw.current_belt_id as string,
      current_degree: raw.current_degree as number,
      updated_at: raw.updated_at as string,
      belt: beltsRel ?? null,
      openPlan: open?.plans
        ? {
            plan_id: open.plan_id,
            due_day: open.due_day,
            plan_name: open.plans.name,
            plan_kind: open.plans.kind,
          }
        : null,
    };
  });

  return {
    rows,
    total: count ?? 0,
    page,
    pageSize,
  };
}
