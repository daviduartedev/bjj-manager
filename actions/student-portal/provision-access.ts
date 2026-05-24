"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/auth";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { ROUTES, routeAlunoPerfil } from "@/lib/routes";
import { findAuthUserIdByEmail, createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { provisionPortalAccessSchema } from "@/lib/validations/student-portal";

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

/**
 * Professor associa acesso ao portal: Auth existente + `students.user_id` (**AUTH-8.3**, **SPT-2.3**).
 */
export async function provisionStudentPortalAccess(
  input: unknown,
): Promise<StudentPortalActionResult> {
  try {
    const parsed = provisionPortalAccessSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Corrija os campos destacados.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    const ctx = await getCurrentAccount();
    if (!ctx || ctx.profile.role !== "professor") {
      return { ok: false, error: "Sem permissão para provisionar acesso ao portal." };
    }

    const admin = createAdminClient();
    if (!admin) {
      return {
        ok: false,
        error:
          "Provisionamento indisponível: configure SUPABASE_SERVICE_ROLE_KEY no servidor.",
      };
    }

    const supabase = await createClient();
    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id, full_name, account_id, archived_at, removed_at, user_id")
      .eq("id", parsed.data.studentId)
      .eq("account_id", ctx.account.id)
      .maybeSingle();

    if (studentErr || !student) {
      return { ok: false, error: "Aluno não encontrado nesta academia." };
    }

    if (student.archived_at || student.removed_at) {
      return {
        ok: false,
        error: "Não é possível provisionar portal para aluno arquivado ou removido.",
      };
    }

    if (student.user_id) {
      return { ok: false, error: "Este aluno já tem acesso ao portal associado." };
    }

    const authUserId = await findAuthUserIdByEmail(parsed.data.authEmail);
    if (!authUserId) {
      return {
        ok: false,
        error: "Não encontramos utilizador Auth com este e-mail. Crie-o no Supabase Auth primeiro.",
        fieldErrors: { authEmail: ["E-mail não encontrado no Auth."] },
      };
    }

    const { data: existingStudentLink } = await admin
      .from("students")
      .select("id")
      .eq("account_id", ctx.account.id)
      .eq("user_id", authUserId)
      .maybeSingle();

    if (existingStudentLink && existingStudentLink.id !== student.id) {
      return {
        ok: false,
        error: "Este utilizador Auth já está ligado a outro aluno nesta academia.",
      };
    }

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, account_id, role")
      .eq("user_id", authUserId)
      .maybeSingle();

    if (existingProfile) {
      if (existingProfile.account_id !== ctx.account.id) {
        return {
          ok: false,
          error: "Este utilizador pertence a outra academia e não pode ser associado aqui.",
        };
      }
      if (existingProfile.role === "professor") {
        return {
          ok: false,
          error: "Este e-mail pertence a um utilizador operacional, não a um aluno.",
        };
      }
    } else {
      const { error: profileInsertErr } = await admin.from("profiles").insert({
        user_id: authUserId,
        account_id: ctx.account.id,
        display_name: student.full_name,
        role: "student",
      });
      if (profileInsertErr) {
        return {
          ok: false,
          error: mapDatabaseErrorToUserMessage(profileInsertErr) ?? "Não foi possível criar o perfil do aluno.",
        };
      }
    }

    const { error: linkErr } = await supabase
      .from("students")
      .update({ user_id: authUserId })
      .eq("id", student.id)
      .eq("account_id", ctx.account.id);

    if (linkErr) {
      return {
        ok: false,
        error: mapDatabaseErrorToUserMessage(linkErr) ?? "Não foi possível associar o acesso.",
      };
    }

    revalidatePath(routeAlunoPerfil(student.id));
    revalidatePath(ROUTES.portal);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(e) ?? "Não foi possível provisionar o acesso.",
    };
  }
}
