"use server";

import { revalidatePath } from "next/cache";

import {
  getStudentForCurrentUser,
  isMinorForPortalGuardian,
} from "@/lib/auth/student-context";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { ROUTES } from "@/lib/routes";
import { toCalendarDateStringInAppTZ } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import {
  completeStudentOnboardingSchema,
  completeStudentOnboardingWithGuardianSchema,
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

export async function completeStudentOnboarding(
  input: unknown,
): Promise<StudentPortalActionResult> {
  try {
    const student = await getStudentForCurrentUser();
    if (!student) {
      return { ok: false, error: "Sessão de aluno inválida para onboarding." };
    }

    if (student.archived_at || student.removed_at) {
      return { ok: false, error: "Acesso ao portal bloqueado para este cadastro." };
    }

    const todayYmd = toCalendarDateStringInAppTZ(new Date());
    const needsGuardian = isMinorForPortalGuardian({
      kind: student.kind,
      birth_date: student.birth_date,
      todayYmd,
    });

    const parsed = (needsGuardian
      ? completeStudentOnboardingWithGuardianSchema
      : completeStudentOnboardingSchema
    ).safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    const guardianEmail = needsGuardian
      ? (parsed.data as { guardianEmail: string }).guardianEmail.trim()
      : (parsed.data.guardianEmail?.trim() || null);

    const supabase = await createClient();
    const { error } = await supabase
      .from("students")
      .update({
        portal_terms_accepted_at: new Date().toISOString(),
        guardian_email: guardianEmail,
      })
      .eq("id", student.id)
      .eq("user_id", student.user_id);

    if (error) {
      return {
        ok: false,
        error: mapDatabaseErrorToUserMessage(error) ?? "Não foi possível concluir o onboarding.",
      };
    }

    revalidatePath(ROUTES.portal);
    revalidatePath(ROUTES.portalOnboarding);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(e) ?? "Não foi possível concluir o onboarding.",
    };
  }
}
