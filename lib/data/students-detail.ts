import { createClient } from "@/lib/supabase/server";

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
  email: string | null;
  notes: string | null;
  is_exempt: boolean;
  openPlanId: string | null;
  plan_id: string | null;
  due_day: number | null;
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
      email,
      notes,
      is_exempt,
      student_plans ( id, plan_id, due_day, ended_at )
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
    email: data.email,
    notes: data.notes,
    is_exempt: data.is_exempt === true,
    openPlanId: open?.id ?? null,
    plan_id: open?.plan_id ?? null,
    due_day: open?.due_day ?? null,
  };
}
