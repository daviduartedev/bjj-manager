"use server";

import { revalidatePath } from "next/cache";

import { getBeltsCatalog } from "@/lib/data/students-catalog";
import { buildBeltCatalogMap } from "@/lib/graduation/catalog";
import {
  beltById,
  isBeltSkip,
  isSameBelt,
  validateStep,
  validateTimeline,
} from "@/lib/graduation/belt-order";
import {
  graduatedAtFromYmd,
  validateGraduatedAtNotFuture,
} from "@/lib/graduation/graduated-at";
import { syncStudentCurrentFromEvents } from "@/lib/graduation/sync-current";
import type { GraduationEventInput } from "@/lib/graduation/types";
import {
  routeAlunoGraduacoes,
  routeAlunoPerfil,
} from "@/lib/routes";
import { mapStudentServerError } from "@/lib/students/action-errors";
import { createClient } from "@/lib/supabase/server";
import {
  addGraduationSchema,
  graduationEventSchema,
  updateGraduationSchema,
} from "@/lib/validations/graduations";

export type GraduationActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function fieldErrorsFromZod(err: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  const flat = err.flatten().fieldErrors;
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (v?.length) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

type DbGraduationRow = {
  id: string;
  resulting_belt_id: string;
  resulting_degree: number;
  graduated_at: string;
  was_skip: boolean;
  skip_reason: string | null;
  weight_kg: number | null;
  created_at: string;
};

async function loadStudentGraduations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
): Promise<DbGraduationRow[]> {
  const { data, error } = await supabase
    .from("student_graduations")
    .select(
      "id, resulting_belt_id, resulting_degree, graduated_at, was_skip, skip_reason, weight_kg, created_at",
    )
    .eq("student_id", studentId)
    .order("graduated_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbGraduationRow[];
}

function toEventInput(row: DbGraduationRow): GraduationEventInput {
  return {
    id: row.id,
    resulting_belt_id: row.resulting_belt_id,
    resulting_degree: row.resulting_degree,
    graduated_at: row.graduated_at,
    was_skip: row.was_skip,
    skip_reason: row.skip_reason,
    weight_kg: row.weight_kg,
    created_at: row.created_at,
  };
}

function revalidateGraduationPaths(studentId: string) {
  revalidatePath(routeAlunoPerfil(studentId));
  revalidatePath(routeAlunoGraduacoes(studentId));
}

export async function promoteStudent(
  studentId: string,
  values: unknown,
): Promise<GraduationActionResult> {
  try {
    const parsed = graduationEventSchema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }
    const v = parsed.data;

    const dateErr = validateGraduatedAtNotFuture(v.graduated_at);
    if (dateErr) return { ok: false, error: dateErr };

    const belts = await getBeltsCatalog();
    const catalog = buildBeltCatalogMap(belts);
    const toBelt = beltById(catalog, v.resulting_belt_id);
    if (!toBelt) return { ok: false, error: "Faixa inválida." };

    const supabase = await createClient();

    const { data: student, error: stErr } = await supabase
      .from("students")
      .select("id, current_belt_id, current_degree")
      .eq("id", studentId)
      .maybeSingle();
    if (stErr) throw stErr;
    if (!student) return { ok: false, error: "Registo não encontrado." };

    const fromBelt = beltById(catalog, student.current_belt_id as string);
    if (!fromBelt) return { ok: false, error: "Faixa actual inválida." };

    if (
      isSameBelt(fromBelt, toBelt) &&
      v.resulting_degree === (student.current_degree as number)
    ) {
      return {
        ok: false,
        error: "A graduação proposta é igual ao estado actual do aluno.",
      };
    }

    const stepErr = validateStep(
      { belt: fromBelt, degree: student.current_degree as number },
      { belt: toBelt, degree: v.resulting_degree },
      v.was_skip,
      v.skip_reason ?? null,
    );
    if (stepErr) return { ok: false, error: stepErr };

    const graduatedAt = graduatedAtFromYmd(v.graduated_at);

    const { error: insErr } = await supabase.from("student_graduations").insert({
      student_id: studentId,
      resulting_belt_id: v.resulting_belt_id,
      resulting_degree: v.resulting_degree,
      graduated_at: graduatedAt.toISOString(),
      was_skip: v.was_skip,
      skip_reason: v.was_skip ? v.skip_reason : null,
      weight_kg: v.weight_kg ?? null,
    });
    if (insErr) throw insErr;

    const all = await loadStudentGraduations(supabase, studentId);
    await syncStudentCurrentFromEvents(
      supabase,
      studentId,
      all.map(toEventInput),
    );

    revalidateGraduationPaths(studentId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

export async function addGraduation(
  studentId: string,
  values: unknown,
): Promise<GraduationActionResult> {
  try {
    const parsed = addGraduationSchema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }
    const v = parsed.data;

    const dateErr = validateGraduatedAtNotFuture(v.graduated_at);
    if (dateErr) return { ok: false, error: dateErr };

    const belts = await getBeltsCatalog();
    const catalog = buildBeltCatalogMap(belts);
    if (!beltById(catalog, v.resulting_belt_id)) {
      return { ok: false, error: "Faixa inválida." };
    }

    const supabase = await createClient();

    const { data: student, error: stErr } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .maybeSingle();
    if (stErr) throw stErr;
    if (!student) return { ok: false, error: "Registo não encontrado." };

    const existing = await loadStudentGraduations(supabase, studentId);
    const graduatedAt = graduatedAtFromYmd(v.graduated_at);

    const candidate: GraduationEventInput = {
      resulting_belt_id: v.resulting_belt_id,
      resulting_degree: v.resulting_degree,
      graduated_at: graduatedAt.toISOString(),
      was_skip: v.was_skip,
      skip_reason: v.was_skip ? (v.skip_reason ?? null) : null,
      weight_kg: v.weight_kg ?? null,
    };

    const timelineErr = validateTimeline(
      [...existing.map(toEventInput), candidate],
      catalog,
    );
    if (timelineErr) return { ok: false, error: timelineErr };

    const { error: insErr } = await supabase.from("student_graduations").insert({
      student_id: studentId,
      resulting_belt_id: v.resulting_belt_id,
      resulting_degree: v.resulting_degree,
      graduated_at: graduatedAt.toISOString(),
      was_skip: v.was_skip,
      skip_reason: v.was_skip ? v.skip_reason : null,
      weight_kg: v.weight_kg ?? null,
    });
    if (insErr) throw insErr;

    const all = await loadStudentGraduations(supabase, studentId);
    await syncStudentCurrentFromEvents(
      supabase,
      studentId,
      all.map(toEventInput),
    );

    revalidateGraduationPaths(studentId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

export async function updateGraduation(
  studentId: string,
  values: unknown,
): Promise<GraduationActionResult> {
  try {
    const parsed = updateGraduationSchema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }
    const v = parsed.data;

    const dateErr = validateGraduatedAtNotFuture(v.graduated_at);
    if (dateErr) return { ok: false, error: dateErr };

    const belts = await getBeltsCatalog();
    const catalog = buildBeltCatalogMap(belts);
    if (!beltById(catalog, v.resulting_belt_id)) {
      return { ok: false, error: "Faixa inválida." };
    }

    const supabase = await createClient();

    const { data: student, error: stErr } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .maybeSingle();
    if (stErr) throw stErr;
    if (!student) return { ok: false, error: "Registo não encontrado." };

    const existing = await loadStudentGraduations(supabase, studentId);
    const idx = existing.findIndex((r) => r.id === v.graduationId);
    if (idx < 0) return { ok: false, error: "Registo não encontrado." };

    const graduatedAt = graduatedAtFromYmd(v.graduated_at);
    const updated: GraduationEventInput = {
      id: v.graduationId,
      resulting_belt_id: v.resulting_belt_id,
      resulting_degree: v.resulting_degree,
      graduated_at: graduatedAt.toISOString(),
      was_skip: v.was_skip,
      skip_reason: v.was_skip ? (v.skip_reason ?? null) : null,
      weight_kg: v.weight_kg ?? null,
      created_at: existing[idx]!.created_at,
    };

    const nextEvents = existing.map((r, i) =>
      i === idx ? updated : toEventInput(r),
    );
    const timelineErr = validateTimeline(nextEvents, catalog);
    if (timelineErr) return { ok: false, error: timelineErr };

    const { error: updErr } = await supabase
      .from("student_graduations")
      .update({
        resulting_belt_id: v.resulting_belt_id,
        resulting_degree: v.resulting_degree,
        graduated_at: graduatedAt.toISOString(),
        was_skip: v.was_skip,
        skip_reason: v.was_skip ? v.skip_reason : null,
        weight_kg: v.weight_kg ?? null,
      })
      .eq("id", v.graduationId)
      .eq("student_id", studentId);
    if (updErr) throw updErr;

    const all = await loadStudentGraduations(supabase, studentId);
    await syncStudentCurrentFromEvents(
      supabase,
      studentId,
      all.map(toEventInput),
    );

    revalidateGraduationPaths(studentId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapStudentServerError(e) };
  }
}

/** Detecta se a transição implica pulo de faixa (para UI). */
export async function detectBeltSkip(
  studentId: string,
  beltId: string,
): Promise<{ isSkip: boolean; fromLabel: string | null; toLabel: string | null }> {
  try {
    const belts = await getBeltsCatalog();
    const catalog = buildBeltCatalogMap(belts);
    const toBelt = beltById(catalog, beltId);
    if (!toBelt) return { isSkip: false, fromLabel: null, toLabel: null };

    const supabase = await createClient();
    const { data: student } = await supabase
      .from("students")
      .select("current_belt_id")
      .eq("id", studentId)
      .maybeSingle();
    if (!student) return { isSkip: false, fromLabel: null, toLabel: null };

    const fromBelt = beltById(catalog, student.current_belt_id as string);
    if (!fromBelt) return { isSkip: false, fromLabel: null, toLabel: null };

    const skipped = isBeltSkip(fromBelt, toBelt);
    return {
      isSkip: skipped,
      fromLabel: fromBelt.slug,
      toLabel: toBelt.slug,
    };
  } catch {
    return { isSkip: false, fromLabel: null, toLabel: null };
  }
}
