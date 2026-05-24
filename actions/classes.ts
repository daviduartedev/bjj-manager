"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/auth";
import { expandSessionsForSchedules } from "@/lib/classes/session-generator";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  classSchema,
  deleteScheduleSchema,
  enrollStudentSchema,
  recurringScheduleSchema,
  unenrollStudentSchema,
  updateClassSchema,
} from "@/lib/validations/classes";

export type ClassActionResult =
  | { ok: true; id?: string }
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

async function requireProfessor() {
  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "professor") return null;
  return ctx;
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function assertProfileInAccount(
  supabase: SupabaseServer,
  profileId: string,
  accountId: string,
): Promise<ClassActionResult | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Instrutor inválido para esta academia." };
  }
  return null;
}

async function assertStudentInAccount(
  supabase: SupabaseServer,
  studentId: string,
  accountId: string,
): Promise<ClassActionResult | null> {
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Aluno não encontrado nesta academia." };
  }
  return null;
}

// ─── Turmas ──────────────────────────────────────────────────────────────────

export async function createClass(input: unknown): Promise<ClassActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = classSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();

  const instructorError = await assertProfileInAccount(
    supabase,
    parsed.data.instructorProfileId,
    ctx.profile.account_id,
  );
  if (instructorError) return instructorError;

  const { data, error } = await supabase
    .from("classes")
    .insert({
      account_id: ctx.profile.account_id,
      name: parsed.data.name,
      kind: parsed.data.kind,
      instructor_profile_id: parsed.data.instructorProfileId,
    })
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(error) ?? "Não foi possível criar a turma.",
    };
  }

  revalidatePath(ROUTES.aulasTurmas);
  return { ok: true, id: data.id as string };
}

export async function updateClass(input: unknown): Promise<ClassActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = updateClassSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();

  const instructorError = await assertProfileInAccount(
    supabase,
    parsed.data.instructorProfileId,
    ctx.profile.account_id,
  );
  if (instructorError) return instructorError;

  const { error } = await supabase
    .from("classes")
    .update({
      name: parsed.data.name,
      kind: parsed.data.kind,
      instructor_profile_id: parsed.data.instructorProfileId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.classId)
    .eq("account_id", ctx.profile.account_id);

  if (error) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(error) ?? "Não foi possível atualizar a turma.",
    };
  }

  revalidatePath(ROUTES.aulasTurmas);
  return { ok: true };
}

// ─── Horários recorrentes ────────────────────────────────────────────────────

export async function addRecurringSchedule(input: unknown): Promise<ClassActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = recurringScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();

  const { data: existingClass, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("id", parsed.data.classId)
    .eq("account_id", ctx.profile.account_id)
    .maybeSingle();

  if (classError || !existingClass) {
    return { ok: false, error: "Turma não encontrada." };
  }

  const { data: scheduleData, error: scheduleError } = await supabase
    .from("class_recurring_schedules")
    .insert({
      account_id: ctx.profile.account_id,
      class_id: parsed.data.classId,
      day_of_week: parsed.data.dayOfWeek,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
    })
    .select("id")
    .single();

  if (scheduleError) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(scheduleError) ?? "Não foi possível salvar o horário.",
    };
  }

  const schedule = {
    classId: parsed.data.classId,
    accountId: ctx.profile.account_id,
    dayOfWeek: parsed.data.dayOfWeek,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
  };
  const sessions = expandSessionsForSchedules([schedule], new Date());

  if (sessions.length > 0) {
    await supabase.from("class_sessions").upsert(
      sessions.map((s) => ({
        account_id: s.accountId,
        class_id: s.classId,
        session_date: s.sessionDate,
        start_time: s.startTime,
        end_time: s.endTime,
      })),
      { onConflict: "class_id,session_date,start_time", ignoreDuplicates: true },
    );
  }

  revalidatePath(ROUTES.aulas);
  return { ok: true, id: scheduleData.id as string };
}

export async function deleteRecurringSchedule(input: unknown): Promise<ClassActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = deleteScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("class_recurring_schedules")
    .delete()
    .eq("id", parsed.data.scheduleId)
    .eq("account_id", ctx.profile.account_id);

  if (error) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(error) ?? "Não foi possível remover o horário.",
    };
  }

  revalidatePath(ROUTES.aulas);
  return { ok: true };
}

// ─── Inscrições ──────────────────────────────────────────────────────────────

export async function enrollStudent(input: unknown): Promise<ClassActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = enrollStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();

  const { data: existingClass } = await supabase
    .from("classes")
    .select("id")
    .eq("id", parsed.data.classId)
    .eq("account_id", ctx.profile.account_id)
    .maybeSingle();

  if (!existingClass) {
    return { ok: false, error: "Turma não encontrada." };
  }

  const studentError = await assertStudentInAccount(
    supabase,
    parsed.data.studentId,
    ctx.profile.account_id,
  );
  if (studentError) return studentError;

  const { error } = await supabase.from("student_class_enrollments").insert({
    account_id: ctx.profile.account_id,
    class_id: parsed.data.classId,
    student_id: parsed.data.studentId,
  });

  if (error) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(error) ?? "Não foi possível inscrever o aluno.",
    };
  }

  revalidatePath(ROUTES.aulasTurmas);
  return { ok: true };
}

export async function unenrollStudent(input: unknown): Promise<ClassActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = unenrollStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_class_enrollments")
    .delete()
    .eq("class_id", parsed.data.classId)
    .eq("student_id", parsed.data.studentId)
    .eq("account_id", ctx.profile.account_id);

  if (error) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(error) ?? "Não foi possível remover a inscrição.",
    };
  }

  revalidatePath(ROUTES.aulasTurmas);
  return { ok: true };
}
