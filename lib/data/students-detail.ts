import type { ReferencedGraduationFields } from "@/lib/modalities/referenced-ranks";
import { createClient } from "@/lib/supabase/server";
import { currentBeltDegreeGraduationMeta } from "@/lib/students/graduation-current-since";

export type StudentEditRow = ReferencedGraduationFields & {
  id: string;
  full_name: string;
  kind: "adult" | "kids" | "baby";
  status: string;
  birth_date: string | null;
  academy_start_date: string | null;
  current_belt_id: string | null;
  current_degree: number | null;
  document: string | null;
  phone: string | null;
  guardian_phone: string | null;
  email: string | null;
  notes: string | null;
  is_exempt: boolean;
  openPlanId: string | null;
  plan_id: string | null;
  due_day: number | null;
  graduationWeightKg: number | null;
  graduationEventId: string | null;
};

export async function getStudentByIdForEdit(
  studentId: string,
): Promise<StudentEditRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      `
      id,
      full_name,
      kind,
      status,
      birth_date,
      academy_start_date,
      graduation_reference_id,
      current_rank_code,
      current_rank_date,
      current_belt_id,
      current_degree,
      weight_kg,
      document,
      phone,
      guardian_phone,
      email,
      notes,
      is_exempt,
      student_plans ( id, plan_id, due_day, ended_at ),
      student_graduations ( id, resulting_belt_id, resulting_degree, graduated_at, weight_kg )
    `,
    )
    .eq("id", studentId)
    .maybeSingle();

  if (error || !data) return null;

  const plans = data.student_plans as {
    id: string;
    plan_id: string;
    due_day: number;
    ended_at: string | null;
  }[];
  const open = plans?.find((p) => p.ended_at == null);
  const gradsRaw = data.student_graduations as
    | {
        id: string;
        resulting_belt_id: string;
        resulting_degree: number;
        graduated_at: string;
        weight_kg: number | null;
      }[]
    | null;
  const gradMeta = data.current_belt_id == null ? null : currentBeltDegreeGraduationMeta(
    (gradsRaw ?? []).map((g) => ({
      id: g.id,
      resulting_belt_id: g.resulting_belt_id,
      resulting_degree: g.resulting_degree,
      graduated_at: g.graduated_at,
      weight_kg: g.weight_kg,
    })),
    data.current_belt_id as string,
    data.current_degree as number,
  );

  return {
    id: data.id,
    full_name: data.full_name,
    kind: data.kind as "adult" | "kids" | "baby",
    status: data.status,
    birth_date: data.birth_date,
    academy_start_date: data.academy_start_date,
    current_belt_id: data.current_belt_id,
    graduation_reference_id: data.graduation_reference_id as string | null,
    current_rank_code: data.current_rank_code as string | null,
    current_rank_date: data.current_rank_date as string | null,
    current_degree: data.current_degree,
    document: data.document,
    phone: data.phone,
    guardian_phone: data.guardian_phone as string | null,
    email: data.email,
    notes: data.notes,
    is_exempt: data.is_exempt === true,
    openPlanId: open?.id ?? null,
    plan_id: open?.plan_id ?? null,
    due_day: open?.due_day ?? null,
    graduationWeightKg: data.current_belt_id == null ? data.weight_kg : gradMeta?.weightKg ?? null,
    graduationEventId: gradMeta?.graduationId ?? null,
  };
}
