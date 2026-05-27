"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/auth";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { ROUTES, routeAulasSessao } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  convertCheckInsSchema,
  manualAttendanceSchema,
  removeAttendanceSchema,
} from "@/lib/validations/attendances";

export type AttendanceActionResult =
  | { ok: true; count?: number }
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

async function loadSessionForProfessor(
  supabase: SupabaseServer,
  classSessionId: string,
  accountId: string,
): Promise<
  | { ok: false; error: string }
  | { ok: true; session: { id: string; class_id: string } }
> {
  const { data, error } = await supabase
    .from("class_sessions")
    .select("id, class_id")
    .eq("id", classSessionId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Sessão não encontrada." };
  }

  return {
    ok: true,
    session: { id: data.id as string, class_id: data.class_id as string },
  };
}

/** SPT-6.2 — Converte check-ins em presença oficial. */
export async function convertCheckInsToAttendances(
  input: unknown,
): Promise<AttendanceActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = convertCheckInsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();
  const loaded = await loadSessionForProfessor(
    supabase,
    parsed.data.classSessionId,
    ctx.profile.account_id,
  );
  if (!loaded.ok) return { ok: false, error: loaded.error };

  const { data: checkIns, error: checkInsError } = await supabase
    .from("check_ins")
    .select("student_id")
    .eq("class_session_id", parsed.data.classSessionId);

  if (checkInsError) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(checkInsError) ?? "Não foi possível ler os check-ins.",
    };
  }

  const { data: existingAttendances, error: attendancesError } = await supabase
    .from("attendances")
    .select("student_id")
    .eq("class_session_id", parsed.data.classSessionId);

  if (attendancesError) {
    return {
      ok: false,
      error:
        mapDatabaseErrorToUserMessage(attendancesError) ??
        "Não foi possível ler as presenças.",
    };
  }

  const attendedIds = new Set(
    (existingAttendances ?? []).map((a) => a.student_id as string),
  );
  let pendingStudentIds = (checkIns ?? [])
    .map((c) => c.student_id as string)
    .filter((id) => !attendedIds.has(id));

  if (parsed.data.studentIds?.length) {
    const selected = new Set(parsed.data.studentIds);
    pendingStudentIds = pendingStudentIds.filter((id) => selected.has(id));
  }

  if (pendingStudentIds.length === 0) {
    return { ok: false, error: "Nenhum check-in pendente para confirmar." };
  }

  const rows = pendingStudentIds.map((studentId) => ({
    account_id: ctx.profile.account_id,
    class_session_id: parsed.data.classSessionId,
    student_id: studentId,
    recorded_by: ctx.profile.id,
    origin: "checkin_student" as const,
  }));

  const { error: insertError } = await supabase.from("attendances").insert(rows);

  if (insertError) {
    return {
      ok: false,
      error:
        mapDatabaseErrorToUserMessage(insertError) ??
        "Não foi possível confirmar a presença.",
    };
  }

  revalidatePath(routeAulasSessao(parsed.data.classSessionId));
  revalidatePath(ROUTES.aulas);
  return { ok: true, count: rows.length };
}

/** SPT-6.3 — Presença manual de aluno inscrito sem check-in. */
export async function recordManualAttendance(
  input: unknown,
): Promise<AttendanceActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = manualAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();
  const loaded = await loadSessionForProfessor(
    supabase,
    parsed.data.classSessionId,
    ctx.profile.account_id,
  );
  if (!loaded.ok) return { ok: false, error: loaded.error };

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("student_class_enrollments")
    .select("id")
    .eq("class_id", loaded.session.class_id)
    .eq("student_id", parsed.data.studentId)
    .eq("account_id", ctx.profile.account_id)
    .maybeSingle();

  if (enrollmentError || !enrollment) {
    return { ok: false, error: "Aluno não inscrito nesta turma." };
  }

  const { data: checkIn, error: checkInError } = await supabase
    .from("check_ins")
    .select("id")
    .eq("class_session_id", parsed.data.classSessionId)
    .eq("student_id", parsed.data.studentId)
    .maybeSingle();

  if (checkInError) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(checkInError) ?? "Não foi possível validar check-in.",
    };
  }

  if (checkIn) {
    return {
      ok: false,
      error: "Use a conversão de check-in para alunos que já fizeram check-in.",
    };
  }

  const { data: existingAttendance, error: existingError } = await supabase
    .from("attendances")
    .select("id")
    .eq("class_session_id", parsed.data.classSessionId)
    .eq("student_id", parsed.data.studentId)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      error:
        mapDatabaseErrorToUserMessage(existingError) ??
        "Não foi possível validar presença existente.",
    };
  }

  if (existingAttendance) {
    return { ok: false, error: "Presença já registada para este aluno." };
  }

  const { error: insertError } = await supabase.from("attendances").insert({
    account_id: ctx.profile.account_id,
    class_session_id: parsed.data.classSessionId,
    student_id: parsed.data.studentId,
    recorded_by: ctx.profile.id,
    origin: "manual_instructor",
  });

  if (insertError) {
    return {
      ok: false,
      error:
        mapDatabaseErrorToUserMessage(insertError) ??
        "Não foi possível registar presença manual.",
    };
  }

  revalidatePath(routeAulasSessao(parsed.data.classSessionId));
  revalidatePath(ROUTES.aulas);
  return { ok: true, count: 1 };
}

/** SPT-6.4 — Remove presença oficial; check-in permanece. */
export async function removeSessionAttendance(
  input: unknown,
): Promise<AttendanceActionResult> {
  const ctx = await requireProfessor();
  if (!ctx) return { ok: false, error: "Sem permissão." };

  const parsed = removeAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const supabase = await createClient();
  const loaded = await loadSessionForProfessor(
    supabase,
    parsed.data.classSessionId,
    ctx.profile.account_id,
  );
  if (!loaded.ok) return { ok: false, error: loaded.error };

  const { data: deleted, error } = await supabase
    .from("attendances")
    .delete()
    .eq("class_session_id", parsed.data.classSessionId)
    .eq("student_id", parsed.data.studentId)
    .eq("account_id", ctx.profile.account_id)
    .select("id");

  if (error) {
    return {
      ok: false,
      error:
        mapDatabaseErrorToUserMessage(error) ?? "Não foi possível remover a presença.",
    };
  }

  if (!deleted?.length) {
    return { ok: false, error: "Presença não encontrada para remover." };
  }

  revalidatePath(routeAulasSessao(parsed.data.classSessionId));
  revalidatePath(ROUTES.aulas);
  return { ok: true, count: 1 };
}
