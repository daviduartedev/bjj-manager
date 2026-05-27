"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/auth";
import { mapDatabaseErrorToUserMessage } from "@/lib/errors/map-database-error";
import { ROUTES, routeAlunoPerfil } from "@/lib/routes";
import {
  createAdminClient,
  createAuthUserWithPassword,
  findAuthUserIdByEmail,
  generateTemporaryPassword,
  inviteAuthUserByEmail,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { provisionPortalAccessSchema } from "@/lib/validations/student-portal";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProvisionPortalSuccessOutcome =
  | { kind: "linked" }
  | { kind: "invited"; email: string }
  | { kind: "password_created"; email: string; temporaryPassword: string };

export type StudentPortalActionResult =
  | { ok: true; outcome: ProvisionPortalSuccessOutcome }
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

type LoadedStudent = {
  id: string;
  full_name: string;
  account_id: string;
  archived_at: string | null;
  removed_at: string | null;
  user_id: string | null;
};

async function loadStudentForProvision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  accountId: string,
): Promise<{ ok: true; student: LoadedStudent } | { ok: false; error: string }> {
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .select("id, full_name, account_id, archived_at, removed_at, user_id")
    .eq("id", studentId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (studentErr || !student) {
    return { ok: false, error: "Aluno não encontrado nesta academia." };
  }

  return {
    ok: true,
    student: student as LoadedStudent,
  };
}

function assertStudentEligible(student: LoadedStudent): StudentPortalActionResult | null {
  if (student.archived_at || student.removed_at) {
    return {
      ok: false,
      error: "Não é possível provisionar portal para aluno arquivado ou removido.",
    };
  }

  if (student.user_id) {
    return { ok: false, error: "Este aluno já tem acesso ao portal associado." };
  }

  return null;
}

async function assertAuthNotLinkedToOtherStudent(
  admin: SupabaseClient,
  accountId: string,
  authUserId: string,
  studentId: string,
): Promise<StudentPortalActionResult | null> {
  const { data: existingStudentLink } = await admin
    .from("students")
    .select("id")
    .eq("account_id", accountId)
    .eq("user_id", authUserId)
    .maybeSingle();

  if (existingStudentLink && existingStudentLink.id !== studentId) {
    return {
      ok: false,
      error: "Este utilizador Auth já está ligado a outro aluno nesta academia.",
    };
  }

  return null;
}

async function ensureStudentProfile(
  admin: SupabaseClient,
  authUserId: string,
  accountId: string,
  displayName: string,
): Promise<StudentPortalActionResult | null> {
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, account_id, role")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (existingProfile) {
    if (existingProfile.account_id !== accountId) {
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
    return null;
  }

  const { error: profileInsertErr } = await admin.from("profiles").insert({
    user_id: authUserId,
    account_id: accountId,
    display_name: displayName,
    role: "student",
  });

  if (profileInsertErr) {
    return {
      ok: false,
      error:
        mapDatabaseErrorToUserMessage(profileInsertErr) ??
        "Não foi possível criar o perfil do aluno.",
    };
  }

  return null;
}

async function linkStudentUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  accountId: string,
  authUserId: string,
): Promise<StudentPortalActionResult | null> {
  const { error: linkErr } = await supabase
    .from("students")
    .update({ user_id: authUserId })
    .eq("id", studentId)
    .eq("account_id", accountId);

  if (linkErr) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(linkErr) ?? "Não foi possível associar o acesso.",
    };
  }

  return null;
}

async function finalizeProvision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  admin: SupabaseClient,
  student: LoadedStudent,
  authUserId: string,
  outcome: ProvisionPortalSuccessOutcome,
): Promise<StudentPortalActionResult> {
  const profileError = await ensureStudentProfile(
    admin,
    authUserId,
    student.account_id,
    student.full_name,
  );
  if (profileError) return profileError;

  const linkError = await linkStudentUserId(
    supabase,
    student.id,
    student.account_id,
    authUserId,
  );
  if (linkError) return linkError;

  revalidatePath(routeAlunoPerfil(student.id));
  revalidatePath(ROUTES.portal);
  return { ok: true, outcome };
}

/**
 * Professor provisiona acesso ao portal (**STU-12**, **AUTH-8.3–8.5**).
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
    const loaded = await loadStudentForProvision(
      supabase,
      parsed.data.studentId,
      ctx.account.id,
    );
    if (!loaded.ok) return loaded;

    const eligibilityError = assertStudentEligible(loaded.student);
    if (eligibilityError) return eligibilityError;

    if (parsed.data.mode === "link_existing") {
      const authUserId = await findAuthUserIdByEmail(admin, parsed.data.authEmail);
      if (!authUserId) {
        return {
          ok: false,
          error:
            "Não encontramos utilizador Auth com este e-mail. Crie-o ou use «Criar utilizador».",
          fieldErrors: { authEmail: ["E-mail não encontrado no Auth."] },
        };
      }

      const linkConflict = await assertAuthNotLinkedToOtherStudent(
        admin,
        ctx.account.id,
        authUserId,
        loaded.student.id,
      );
      if (linkConflict) return linkConflict;

      return finalizeProvision(supabase, admin, loaded.student, authUserId, {
        kind: "linked",
      });
    }

    const email = parsed.data.email;
    const existingAuthId = await findAuthUserIdByEmail(admin, email);
    if (existingAuthId) {
      return {
        ok: false,
        error:
          "Já existe utilizador Auth com este e-mail. Use «Associar existente» em vez de criar.",
        fieldErrors: { email: ["E-mail já registado no Auth."] },
      };
    }

    if (parsed.data.mode === "create_invite") {
      const invited = await inviteAuthUserByEmail(admin, email);
      if (!invited.ok) {
        return {
          ok: false,
          error: mapInviteError(invited.error),
          fieldErrors: { email: [mapInviteError(invited.error)] },
        };
      }

      return finalizeProvision(supabase, admin, loaded.student, invited.userId, {
        kind: "invited",
        email: email.trim().toLowerCase(),
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const created = await createAuthUserWithPassword(admin, email, temporaryPassword);
    if (!created.ok) {
      return {
        ok: false,
        error: mapCreateUserError(created.error),
        fieldErrors: { email: [mapCreateUserError(created.error)] },
      };
    }

    const result = await finalizeProvision(
      supabase,
      admin,
      loaded.student,
      created.userId,
      {
        kind: "password_created",
        email: email.trim().toLowerCase(),
        temporaryPassword,
      },
    );

    return result;
  } catch (e) {
    return {
      ok: false,
      error: mapDatabaseErrorToUserMessage(e) ?? "Não foi possível provisionar o acesso.",
    };
  }
}

function mapInviteError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already") || lower.includes("registered")) {
    return "Este e-mail já está registado. Use «Associar existente».";
  }
  return "Não foi possível enviar o convite. Verifique o e-mail e tente novamente.";
}

function mapCreateUserError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already") || lower.includes("registered")) {
    return "Este e-mail já está registado. Use «Associar existente».";
  }
  return "Não foi possível criar o utilizador. Tente novamente.";
}
