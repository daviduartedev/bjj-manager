import { getCurrentAccount, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type StudentPortalRow = {
  id: string;
  account_id: string;
  full_name: string;
  kind: "adult" | "kids";
  birth_date: string | null;
  user_id: string | null;
  archived_at: string | null;
  removed_at: string | null;
  portal_terms_accepted_at: string | null;
  guardian_email: string | null;
};

export type StudentPortalAccessState =
  | { kind: "no_session" }
  | { kind: "not_student" }
  | { kind: "no_student_row" }
  | { kind: "blocked_lifecycle"; reason: "archived" | "removed" }
  | { kind: "needs_onboarding" }
  | { kind: "ready"; student: StudentPortalRow };

/**
 * Resolve o registo `students` do utilizador autenticado (**SPT-2.3**).
 */
export async function getStudentForCurrentUser(): Promise<StudentPortalRow | null> {
  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "student") return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, account_id, full_name, kind, birth_date, user_id, archived_at, removed_at, portal_terms_accepted_at, guardian_email",
    )
    .eq("user_id", ctx.user.id)
    .eq("account_id", ctx.profile.account_id)
    .maybeSingle();

  if (error || !data) return null;
  return data as StudentPortalRow;
}

export async function getStudentPortalAccessState(): Promise<StudentPortalAccessState> {
  const user = await getCurrentUser();
  if (!user) return { kind: "no_session" };

  const ctx = await getCurrentAccount();
  if (!ctx || ctx.profile.role !== "student") return { kind: "not_student" };

  const student = await getStudentForCurrentUser();
  if (!student) return { kind: "no_student_row" };

  if (student.archived_at) return { kind: "blocked_lifecycle", reason: "archived" };
  if (student.removed_at) return { kind: "blocked_lifecycle", reason: "removed" };
  if (!student.portal_terms_accepted_at) return { kind: "needs_onboarding" };

  return { kind: "ready", student };
}

export function isMinorForPortalGuardian(args: {
  kind: "adult" | "kids";
  birth_date: string | null;
  todayYmd: string;
}): boolean {
  if (args.kind === "kids") return true;
  if (!args.birth_date) return false;
  const birthYear = Number.parseInt(args.birth_date.slice(0, 4), 10);
  const todayYear = Number.parseInt(args.todayYmd.slice(0, 4), 10);
  if (!Number.isFinite(birthYear) || !Number.isFinite(todayYear)) return false;
  let age = todayYear - birthYear;
  const birthMd = args.birth_date.slice(5);
  const todayMd = args.todayYmd.slice(5);
  if (todayMd < birthMd) age -= 1;
  return age < 18;
}
