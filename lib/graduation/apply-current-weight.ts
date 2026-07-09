import { toCalendarDateStringInAppTZ } from "@/lib/dates/parse-calendar-date";
import { getBeltsCatalog } from "@/lib/data/students-catalog";
import { buildBeltCatalogMap } from "@/lib/graduation/catalog";
import { validateTimeline } from "@/lib/graduation/belt-order";
import {
  graduatedAtFromYmd,
  validateGraduatedAtNotFuture,
} from "@/lib/graduation/graduated-at";
import type { GraduationEventInput } from "@/lib/graduation/types";
import { currentBeltDegreeGraduationMeta } from "@/lib/students/graduation-current-since";
import type { createClient } from "@/lib/supabase/server";

export class GraduationWeightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraduationWeightError";
  }
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

type GraduationRow = {
  id: string;
  resulting_belt_id: string;
  resulting_degree: number;
  graduated_at: string;
  weight_kg: number | null;
  was_skip: boolean;
  skip_reason: string | null;
  created_at: string;
};

function resolveBaselineGraduationDate(args: {
  academyStartDate: string | null;
  existing: GraduationRow[];
}): string {
  if (args.existing.length === 0) {
    if (args.academyStartDate?.trim()) return args.academyStartDate.trim();
    return toCalendarDateStringInAppTZ(new Date());
  }

  const latest = [...args.existing].sort(
    (a, b) =>
      new Date(b.graduated_at).getTime() - new Date(a.graduated_at).getTime(),
  )[0];
  if (latest) {
    return toCalendarDateStringInAppTZ(new Date(latest.graduated_at));
  }
  return toCalendarDateStringInAppTZ(new Date());
}

async function createBaselineGraduationForWeight(
  supabase: Supabase,
  args: {
    studentId: string;
    beltId: string;
    degree: number;
    weightKg: number;
    academyStartDate: string | null;
    existing: GraduationRow[];
  },
): Promise<void> {
  const graduatedAtYmd = resolveBaselineGraduationDate({
    academyStartDate: args.academyStartDate,
    existing: args.existing,
  });

  const dateErr = validateGraduatedAtNotFuture(graduatedAtYmd);
  if (dateErr) throw new GraduationWeightError(dateErr);

  const belts = await getBeltsCatalog();
  const catalog = buildBeltCatalogMap(belts);
  const graduatedAt = graduatedAtFromYmd(graduatedAtYmd);

  const candidate: GraduationEventInput = {
    resulting_belt_id: args.beltId,
    resulting_degree: args.degree,
    graduated_at: graduatedAt.toISOString(),
    was_skip: false,
    skip_reason: null,
    weight_kg: args.weightKg,
  };

  const timelineErr = validateTimeline(
    [
      ...args.existing.map((row) => ({
        id: row.id,
        resulting_belt_id: row.resulting_belt_id,
        resulting_degree: row.resulting_degree,
        graduated_at: row.graduated_at,
        was_skip: row.was_skip,
        skip_reason: row.skip_reason,
        weight_kg: row.weight_kg,
        created_at: row.created_at,
      })),
      candidate,
    ],
    catalog,
  );
  if (timelineErr) {
    throw new GraduationWeightError(
      "Não foi possível registar o peso. Adicione uma graduação para o grau actual em Graduações.",
    );
  }

  const { error: insErr } = await supabase.from("student_graduations").insert({
    student_id: args.studentId,
    resulting_belt_id: args.beltId,
    resulting_degree: args.degree,
    graduated_at: graduatedAt.toISOString(),
    was_skip: false,
    skip_reason: null,
    weight_kg: args.weightKg,
  });
  if (insErr) throw insErr;
}

export async function applyWeightToCurrentGraduation(
  supabase: Supabase,
  studentId: string,
  beltId: string,
  degree: number,
  weightKg: number | null,
): Promise<void> {
  const { data, error } = await supabase
    .from("student_graduations")
    .select(
      "id, resulting_belt_id, resulting_degree, graduated_at, weight_kg, was_skip, skip_reason, created_at",
    )
    .eq("student_id", studentId);
  if (error) throw error;

  const rows = (data ?? []) as GraduationRow[];

  const meta = currentBeltDegreeGraduationMeta(
    rows.map((row) => ({
      id: row.id,
      resulting_belt_id: row.resulting_belt_id,
      resulting_degree: row.resulting_degree,
      graduated_at: row.graduated_at,
      weight_kg: row.weight_kg,
    })),
    beltId,
    degree,
  );

  if (!meta?.graduationId) {
    if (weightKg == null) return;

    const { data: student, error: stErr } = await supabase
      .from("students")
      .select("academy_start_date")
      .eq("id", studentId)
      .maybeSingle();
    if (stErr) throw stErr;
    if (!student) throw new GraduationWeightError("Aluno não encontrado.");

    await createBaselineGraduationForWeight(supabase, {
      studentId,
      beltId,
      degree,
      weightKg,
      academyStartDate: (student.academy_start_date as string | null) ?? null,
      existing: rows,
    });
    return;
  }

  const { error: updErr } = await supabase
    .from("student_graduations")
    .update({ weight_kg: weightKg })
    .eq("id", meta.graduationId)
    .eq("student_id", studentId);
  if (updErr) throw updErr;
}
