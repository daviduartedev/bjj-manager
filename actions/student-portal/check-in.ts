"use server";

import { revalidatePath } from "next/cache";

import { getStudentForCurrentUser } from "@/lib/auth/student-context";
import { isCheckinWindowOpen } from "@/lib/classes/checkin-window";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import {
  isStudentPortalClassesCheckinEnabled,
  isStudentPortalEnabled,
} from "@/lib/feature-flags/student-portal";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  cancelCheckInSchema,
  checkInSchema,
} from "@/lib/validations/student-portal";

export type StudentPortalActionResult =
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

function assertClassesCheckinEnabled(): StudentPortalActionResult | null {
  if (!isStudentPortalEnabled() || !isStudentPortalClassesCheckinEnabled()) {
    return {
      ok: false,
      error: "Check-in de aulas indisponível no momento.",
    };
  }
  return null;
}

type LoadedSession =
  | { ok: false; error: string }
  | {
      ok: true;
      session: {
        id: string;
        session_date: string;
        start_time: string;
        class_id: string;
      };
    };

async function loadSessionForStudent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  classSessionId: string,
  studentId: string,
): Promise<LoadedSession> {
  const { data, error } = await supabase
    .from("class_sessions")
    .select("id, session_date, start_time, class_id")
    .eq("id", classSessionId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Aula não encontrada ou sem permissão." };
  }

  const { data: enrollment } = await supabase
    .from("student_class_enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("class_id", data.class_id)
    .maybeSingle();

  if (!enrollment) {
    return { ok: false, error: "Você não está inscrito nesta turma." };
  }

  return {
    ok: true,
    session: {
      id: data.id as string,
      session_date: data.session_date as string,
      start_time: data.start_time as string,
      class_id: data.class_id as string,
    },
  };
}

export async function createCheckIn(
  input: unknown,
): Promise<StudentPortalActionResult> {
  const flagError = assertClassesCheckinEnabled();
  if (flagError) return flagError;

  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const student = await getStudentForCurrentUser();
    if (!student) {
      return { ok: false, error: "Sessão de aluno inválida." };
    }
    if (student.archived_at || student.removed_at) {
      return { ok: false, error: "Acesso ao portal bloqueado para este cadastro." };
    }

    const supabase = await createClient();
    const loaded = await loadSessionForStudent(
      supabase,
      parsed.data.classSessionId,
      student.id,
    );
    if (!loaded.ok) {
      return { ok: false, error: loaded.error };
    }

    const { session_date, start_time } = loaded.session;
    if (!isCheckinWindowOpen(session_date, start_time)) {
      return {
        ok: false,
        error: "Check-in indisponível fora da janela permitida para esta aula.",
      };
    }

    const { error } = await supabase.from("check_ins").insert({
      class_session_id: parsed.data.classSessionId,
      student_id: student.id,
      account_id: student.account_id,
    });

    if (error) {
      return {
        ok: false,
        error:
          mapDatabaseErrorToUserMessage(error) ??
          "Não foi possível confirmar presença.",
      };
    }

    revalidatePath(ROUTES.portalAulas);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(e) ?? "Não foi possível confirmar presença.",
    };
  }
}

export async function cancelCheckIn(
  input: unknown,
): Promise<StudentPortalActionResult> {
  const flagError = assertClassesCheckinEnabled();
  if (flagError) return flagError;

  const parsed = cancelCheckInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const student = await getStudentForCurrentUser();
    if (!student) {
      return { ok: false, error: "Sessão de aluno inválida." };
    }

    const supabase = await createClient();
    const loaded = await loadSessionForStudent(
      supabase,
      parsed.data.classSessionId,
      student.id,
    );
    if (!loaded.ok) {
      return { ok: false, error: loaded.error };
    }

    const { session_date, start_time } = loaded.session;
    if (!isCheckinWindowOpen(session_date, start_time)) {
      return {
        ok: false,
        error: "Não é possível cancelar check-in após o fechamento da janela.",
      };
    }

    const { data: deleted, error } = await supabase
      .from("check_ins")
      .delete()
      .eq("class_session_id", parsed.data.classSessionId)
      .eq("student_id", student.id)
      .select("id");

    if (error) {
      return {
        ok: false,
        error:
          mapDatabaseErrorToUserMessage(error) ??
          "Não foi possível cancelar o check-in.",
      };
    }

    if (!deleted?.length) {
      return { ok: false, error: "Check-in não encontrado para cancelar." };
    }

    revalidatePath(ROUTES.portalAulas);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(e) ?? "Não foi possível cancelar o check-in.",
    };
  }
}
