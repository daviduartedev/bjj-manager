import { createClient } from "@/lib/supabase/server";
import { STUDENTS_PAGE_SIZE } from "@/lib/constants/students";
import { toCalendarDateStringInAppTZ } from "@/lib/dates/parse-calendar-date";
import type { PlanKind } from "@/lib/students/plan-kind";
import { studentGraduationDurationLine } from "@/lib/students/duration-display";
import { currentBeltDegreeGraduationMeta } from "@/lib/students/graduation-current-since";
import type { GraduationRecordInput } from "@/lib/students/graduation-reference";
import type { StudentListLifecycle } from "@/lib/students/alunos-url";
import type { ListSortKey } from "@/lib/validations/students";

export type ListStudentRow = {
  id: string;
  full_name: string;
  kind: "adult" | "kids";
  status: string;
  is_exempt: boolean;
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
  /** **STU-7.4**, tempo humanizado desde a graduação do grau actual. */
  graduationDurationLine: string | null;
  /** Data civil da graduação que estabeleceu faixa/grau actuais; null se não registada. */
  graduationConfiguredAtYmd: string | null;
  /** Peso (kg) registado nessa graduação, se houver. */
  graduationWeightKg: number | null;
  /** Evento de graduação que estabeleceu faixa/grau actuais; null se não registado. */
  graduationEventId: string | null;
};

export type ListStudentsParams = {
  q?: string;
  /** `plan_kind` do vínculo aberto (`student_plans.ended_at` nulo). */
  plan?: PlanKind;
  status?: "active" | "inactive" | "paused" | "all";
  sort?: ListSortKey;
  page?: number;
  /** Vista de ciclo-vida (**STU-10** / **STU-11**). */
  lista?: StudentListLifecycle;
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

  const planFilter =
    params.plan === "adult" ||
    params.plan === "kids_1" ||
    params.plan === "kids_2"
      ? params.plan
      : undefined;

  const studentPlansSelect = planFilter
    ? `student_plans!inner (
        plan_id,
        due_day,
        ended_at,
        plans!inner ( name, kind )
      )`
    : `student_plans (
        plan_id,
        due_day,
        ended_at,
        plans ( name, kind )
      )`;

  let q = supabase.from("students").select(
    `
      id,
      full_name,
      kind,
      status,
      is_exempt,
      birth_date,
      academy_start_date,
      current_belt_id,
      current_degree,
      updated_at,
      belts!students_current_belt_id_fkey ( slug, kind ),
      ${studentPlansSelect},
      student_graduations ( id, resulting_belt_id, resulting_degree, graduated_at, weight_kg )
    `,
    { count: "exact" },
  );

  const search = params.q?.trim();
  if (search) {
    q = q.ilike("full_name", `%${search}%`);
  }
  if (planFilter) {
    q = q
      .is("student_plans.ended_at", null)
      .eq("student_plans.plans.kind", planFilter);
  }
  if (
    params.status === "active" ||
    params.status === "inactive" ||
    params.status === "paused"
  ) {
    q = q.eq("status", params.status);
  }

  const lista = params.lista ?? "principal";
  if (lista === "principal") {
    q = q.is("archived_at", null).is("removed_at", null);
  } else if (lista === "arquivados") {
    q = q.not("archived_at", "is", null).is("removed_at", null);
  } else if (lista === "removidos") {
    q = q.not("removed_at", "is", null);
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

  const todayYmd = toCalendarDateStringInAppTZ(new Date());

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
    const gradsRaw = raw.student_graduations as GraduationRecordInput[] | null;
    const grads = Array.isArray(gradsRaw) ? gradsRaw : [];
    const beltId = raw.current_belt_id as string;
    const degree = raw.current_degree as number;
    const gradMeta = currentBeltDegreeGraduationMeta(grads, beltId, degree);
    const graduationDurationLine = studentGraduationDurationLine(
      grads,
      beltId,
      degree,
      null,
      todayYmd,
    );
    return {
      id: raw.id as string,
      full_name: raw.full_name as string,
      kind: raw.kind as "adult" | "kids",
      status: raw.status as string,
      is_exempt: raw.is_exempt === true,
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
      graduationDurationLine,
      graduationConfiguredAtYmd: gradMeta?.configuredAtYmd ?? null,
      graduationWeightKg: gradMeta?.weightKg ?? null,
      graduationEventId: gradMeta?.graduationId ?? null,
    };
  });

  return {
    rows,
    total: count ?? 0,
    page,
    pageSize,
  };
}
