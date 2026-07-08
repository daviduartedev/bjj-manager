import { createClient } from "@/lib/supabase/server";
import { currentBeltDegreeGraduationMeta } from "@/lib/students/graduation-current-since";

export type StudentEditRow = {
  id: string;
  full_name: string;
  kind: "adult" | "kids";
  status: string;
  birth_date: string | null;
  academy_start_date: string | null;
  current_belt_id: string;
  current_degree: number;
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
      current_belt_id,
      current_degree,
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
  const gradMeta = currentBeltDegreeGraduationMeta(
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
    kind: data.kind as "adult" | "kids",
    status: data.status,
    birth_date: data.birth_date,
    academy_start_date: data.academy_start_date,
    current_belt_id: data.current_belt_id,
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
    graduationWeightKg: gradMeta?.weightKg ?? null,
    graduationEventId: gradMeta?.graduationId ?? null,
  };
}
