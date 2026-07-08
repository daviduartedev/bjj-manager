import { currentBeltDegreeGraduationMeta } from "@/lib/students/graduation-current-since";
import type { createClient } from "@/lib/supabase/server";

export class GraduationWeightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraduationWeightError";
  }
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function applyWeightToCurrentGraduation(
  supabase: Supabase,
  studentId: string,
  beltId: string,
  degree: number,
  weightKg: number | null,
): Promise<void> {
  const { data, error } = await supabase
    .from("student_graduations")
    .select("id, resulting_belt_id, resulting_degree, graduated_at, weight_kg")
    .eq("student_id", studentId);
  if (error) throw error;

  const meta = currentBeltDegreeGraduationMeta(
    (data ?? []).map((row) => ({
      id: row.id as string,
      resulting_belt_id: row.resulting_belt_id as string,
      resulting_degree: row.resulting_degree as number,
      graduated_at: row.graduated_at as string,
      weight_kg: row.weight_kg as number | null,
    })),
    beltId,
    degree,
  );

  if (!meta?.graduationId) {
    if (weightKg != null) {
      throw new GraduationWeightError(
        "Não há graduação registada para o grau actual. Registe uma graduação antes de informar o peso.",
      );
    }
    return;
  }

  const { error: updErr } = await supabase
    .from("student_graduations")
    .update({ weight_kg: weightKg })
    .eq("id", meta.graduationId)
    .eq("student_id", studentId);
  if (updErr) throw updErr;
}
