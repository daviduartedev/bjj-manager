import { toCalendarDateStringInAppTZ } from "@/lib/dates/parse-calendar-date";
import { getBeltsCatalog } from "@/lib/data/students-catalog";
import { buildBeltCatalogMap } from "@/lib/graduation/catalog";
import { validateTimeline } from "@/lib/graduation/belt-order";
import {
  graduatedAtFromYmd,
  validateGraduatedAtNotFuture,
} from "@/lib/graduation/graduated-at";
import type { GraduationEventInput } from "@/lib/graduation/types";
import type { createClient } from "@/lib/supabase/server";

export class GraduationWeightError extends Error {
  readonly field: "weight_kg" | "academy_start_date";

  constructor(
    message: string,
    field: "weight_kg" | "academy_start_date" = "weight_kg",
  ) {
    super(message);
    this.name = "GraduationWeightError";
    this.field = field;
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

function sameBeltId(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Peso fica na graduação do par (faixa, grau) actual.
 * Se esse par não existir mas o aluno já tiver histórico, actualiza a última
 * graduação em vez de inserir um evento que a timeline rejeita.
 * Sem histórico, devolve null para criar a graduação de base.
 */
export function pickGraduationIdForWeight(
  rows: Pick<
    GraduationRow,
    "id" | "resulting_belt_id" | "resulting_degree" | "graduated_at"
  >[],
  beltId: string,
  degree: number,
): string | null {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(a.graduated_at).getTime() - new Date(b.graduated_at).getTime(),
  );
  const targetDegree = Number(degree);
  let exact: (typeof sorted)[number] | null = null;
  for (const row of sorted) {
    if (
      sameBeltId(row.resulting_belt_id, beltId) &&
      Number(row.resulting_degree) === targetDegree &&
      row.id.trim()
    ) {
      exact = row;
    }
  }
  if (exact) return exact.id;
  const latest = sorted[sorted.length - 1];
  return latest?.id.trim() ? latest.id : null;
}

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
  if (dateErr) {
    throw new GraduationWeightError(dateErr, "academy_start_date");
  }

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
  const graduationId = pickGraduationIdForWeight(rows, beltId, degree);

  if (!graduationId) {
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
    .eq("id", graduationId)
    .eq("student_id", studentId);
  if (updErr) throw updErr;
}
